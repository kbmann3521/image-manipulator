const express = require('express');
const Replicate = require('replicate');
const sharp = require('sharp'); // Import sharp for image compression
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
app.post('/upscale-and-compress-image', async (req, res) => {
  const { image, scale } = req.body;

  if (!image || !scale) {
    return res.status(400).send('Image URL and scale factor are required');
  }

  const input = {
    image,
    scale,
  };

  try {
    // Step 1: Upscale the image using Replicate
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Step 2: Compress the image using Lanczos algorithm (sharp)
    const compressedImageBuffer = await sharp(Buffer.from(output))
      .resize({ fit: sharp.fit.inside, kernel: sharp.kernel.lanczos3 })
      .jpeg({ quality: 80 }) // Set quality for compression (0 to 100)
      .toBuffer(); // Get the compressed image as a buffer

    // Save the compressed image to disk
    await writeFile("output-compressed.jpg", compressedImageBuffer);
    console.log("Compressed output saved to output-compressed.jpg");

    // Send the compressed image back as a download
    res.download('output-compressed.jpg', 'compressed-upscaled-image.jpg');
  } catch (error) {
    console.error('Error during prediction or compression:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
