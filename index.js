const express = require('express');
const Replicate = require('replicate');
const fetch = require('node-fetch'); // Make sure you have node-fetch installed
const { writeFile, readFile } = require('fs/promises');
const sharp = require('sharp');
const path = require('path');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000; // Default to port 3000 okay

// Initialize replicate with the API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from GitHub Secrets or environment variables
});

// Middleware to parse JSON bodies
app.use(express.json());

// Define the endpoint to upscale and compress images
app.post('/upscale-image', async (req, res) => {
  const { image, scale } = req.body;

  if (!image || !scale) {
    return res.status(400).send('Image URL and scale factor are required');
  }

  const input = { image, scale };

  try {
    // Start the prediction process
    const prediction = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Poll the prediction status
    const predictionId = prediction.id;
    let predictionStatus = 'starting';

    // Poll every 2 seconds to check the status
    while (predictionStatus !== 'succeeded' && predictionStatus !== 'failed') {
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        },
      });

      const statusData = await statusResponse.json();
      predictionStatus = statusData.status;

      if (predictionStatus === 'succeeded') {
        const outputUrl = statusData.output;
        console.log('Image processed successfully, output URL:', outputUrl);

        // Compress the image using sharp (if needed)
        const imageBuffer = await fetch(outputUrl).then(res => res.arrayBuffer());
        const compressedImage = await sharp(Buffer.from(imageBuffer))
          .jpeg({ quality: 80 }) // Adjust quality as needed
          .toBuffer();

        const filePath = path.join(__dirname, 'compressed-output.jpg');
        await writeFile(filePath, compressedImage);
        console.log("Compressed output saved to compressed-output.jpg");

        // Serve the image URL as a JSON response
        res.json({ imageUrl: outputUrl });
        return;
      }

      if (predictionStatus === 'failed') {
        return res.status(500).json({ error: 'Upscaling process failed' });
      }

      // Wait for 2 seconds before checking the status again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error('Error during processing:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
