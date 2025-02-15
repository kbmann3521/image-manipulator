const express = require('express');
const Replicate = require('replicate');
const { writeFile, readFile } = require('fs/promises');
const sharp = require('sharp');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000; // Default to port 3000

// Initialize replicate with the API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from GitHub Secrets or environment variables
});

// Middleware to parse JSON bodies
app.use(express.json());

// Define the endpoint to upscale and compress images
app.post('/upscale-image', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).send('Image URL is required');
  }

  try {
    let input = { image, scale: 4 };

    // First upscale
    const firstOutput = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Second upscale
    input.image = firstOutput;
    const secondOutput = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Fetch the upscaled image
    const imageBuffer = await fetch(secondOutput).then(res => res.arrayBuffer());

    // Compress the image using sharp
    const compressedImage = await sharp(Buffer.from(imageBuffer))
      .jpeg({ quality: 80 }) // Adjust quality as needed
      .toBuffer();

    await writeFile("compressed-output.jpg", compressedImage);
    console.log("Compressed output saved to compressed-output.jpg");

    // Send the compressed image as a download
    res.download('compressed-output.jpg', 'upscaled-compressed-image.jpg');
  } catch (error) {
    console.error('Error during processing:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
