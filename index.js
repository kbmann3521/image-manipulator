const express = require('express');
const Replicate = require('replicate');
const sharp = require('sharp'); // Add sharp for image processing
const { writeFile } = require('fs/promises');

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
  const { image, scale } = req.body;

  if (!image || !scale) {
    return res.status(400).send('Image URL and scale factor are required');
  }

  const input = {
    image,
    scale,
  };

  try {
    // Run image upscaling with Replicate
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Save the upscaled image temporarily
    const tempImagePath = 'temp-upscaled-image.png';
    await writeFile(tempImagePath, output);
    console.log("Upscaled image saved temporarily");

    // Compress the upscaled image using sharp with Lanczos filter
    const compressedImageBuffer = await sharp(tempImagePath)
      .resize({ 
        // You can adjust the width or height, depending on your use case
        width: 800, // Example width, adjust accordingly
        height: 800, // Example height, adjust accordingly
        fit: sharp.fit.inside, // Maintains aspect ratio
        kernel: sharp.kernel.lanczos3, // Use Lanczos filter for resizing
      })
      .toBuffer();

    // Save the compressed image
    const compressedImagePath = 'compressed-upscaled-image.png';
    await writeFile(compressedImagePath, compressedImageBuffer);
    console.log("Compressed image saved");

    // Send the compressed image back as a download
    res.download(compressedImagePath, 'compressed-upscaled-image.png');
  } catch (error) {
    console.error('Error during prediction:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
