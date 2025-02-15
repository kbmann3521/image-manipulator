const express = require('express');
const Replicate = require('replicate');
const { writeFile } = require('fs/promises');
const sharp = require('sharp');
const fetch = require('node-fetch'); // Ensure you have node-fetch installed

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Initialize Replicate API
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Function to fetch an image and return a buffer
const fetchImageBuffer = async (url) => {
  const response = await fetch(url);
  return response.arrayBuffer();
};

// Upscale function to run the model twice for 8x upscale
const upscaleImageTwice = async (image) => {
  // First upscale (4x)
  const firstOutput = await replicate.run(
    "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
    { input: { image, scale: 4 } }
  );

  // Fetch the first upscaled image
  const firstImageBuffer = await fetchImageBuffer(firstOutput);

  // Write first upscaled image temporarily
  await writeFile("temp-upscaled.jpg", Buffer.from(firstImageBuffer));

  // Second upscale (another 4x, making it 16x total)
  const secondOutput = await replicate.run(
    "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
    { input: { image: secondOutput, scale: 4 } }
  );

  // Fetch the final upscaled image
  const secondImageBuffer = await fetchImageBuffer(secondOutput);

  return secondImageBuffer;
};

// Define the endpoint to upscale and compress images
app.post('/upscale-image', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).send('Image URL is required');
  }

  try {
    // Run the 2-step upscale process
    const upscaledImageBuffer = await upscaleImageTwice(image);

    // Compress the final 8x upscaled image
    const compressedImage = await sharp(Buffer.from(upscaledImageBuffer))
      .jpeg({ quality: 80 }) // Adjust quality as needed
      .toBuffer();

    await writeFile("compressed-output.jpg", compressedImage);
    console.log("Final compressed output saved to compressed-output.jpg");

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
