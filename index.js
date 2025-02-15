const express = require('express');
const Replicate = require('replicate');
const { writeFile } = require('fs/promises');
const sharp = require('sharp');  // Import Sharp for image processing

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
    // Upscale the image using Replicate
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Save the output image temporarily before compression
    const tempPath = 'upscaled-image.png';
    await writeFile(tempPath, output);
    console.log("Output saved to upscaled-image.png");

    // Compress the image using Sharp with Lanczos resampling
    const compressedImagePath = 'compressed-image.png';
    await sharp(tempPath)
      .resize({ fit: 'inside' })  // Optional: Resize to ensure it's inside a bounding box
      .samplingAlgorithm('lanczos3')  // Apply Lanczos resampling
      .toFormat('png', { quality: 80 })  // Adjust quality to your needs (80% quality for PNG)
      .toFile(compressedImagePath);

    console.log('Image compressed using Lanczos resampling');

    // Send the compressed image as a download
    res.download(compressedImagePath, 'compressed-upscaled-image.png');
  } catch (error) {
    console.error('Error during prediction or compression:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
