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
    // Step 1: First upscale (4x)
    let output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Save the first upscale output temporarily before the second upscale
    const tempPath1 = 'upscaled-first.png';
    await writeFile(tempPath1, output);
    console.log("First upscale complete, saved to upscaled-first.png");

    // Step 2: Second upscale (4x again, to make it 8x total)
    input.image = tempPath1; // Use the first upscaled image as input for the second upscale
    output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Save the second upscale output
    const tempPath2 = 'upscaled-second.png';
    await writeFile(tempPath2, output);
    console.log("Second upscale complete, saved to upscaled-second.png");

    // Compress the final upscaled image using Sharp
    const compressedImagePath = 'compressed-image.png';
    await sharp(tempPath2)
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
