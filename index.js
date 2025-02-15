const express = require('express');
const axios = require('axios');
const Replicate = require('replicate');
const { writeFile } = require('node:fs/promises');
const path = require('path');

const app = express();
app.use(express.json()); // to parse JSON bodies

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // get your key from environment variables
});

// API endpoint to process image
app.post('/process-image', async (req, res) => {
  const { imageUrl, scale } = req.body;

  if (!imageUrl || !scale) {
    return res.status(400).send('Missing required parameters: imageUrl and scale');
  }

  try {
    // Fetch image from the URL
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    // Call Replicate model to upscale the image
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input: { image: imageBuffer, scale } }
    );

    // Save the output image locally
    const outputFilePath = path.join(__dirname, 'output.png');
    await writeFile(outputFilePath, output);

    // Send the processed image back to the client
    res.sendFile(outputFilePath);
  } catch (error) {
    console.error('Error during image processing:', error);
    res.status(500).send('Error processing the image');
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
