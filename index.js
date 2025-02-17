const express = require('express');
const Replicate = require('replicate');
const { writeFile, readFile } = require('fs/promises');
const sharp = require('sharp');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000; // Default to port 3000

// Initialize replicate with the API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from environment variables
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
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Fetch the upscaled image
    const imageBuffer = await fetch(output).then(res => res.arrayBuffer());

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

// Define the endpoint to generate an image
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).send('Prompt is required');
  }

  const input = { prompt };

  try {
    const output = await replicate.run(
      "stability-ai/stable-diffusion-3.5-large:e6c4657fe1b3f078fb26d68a1413bc8013e2b085504dd84a33e26e16fb95a593",
      { input }
    );

    // Save the generated images to disk
    const savedFiles = [];
    for (const [index, item] of Object.entries(output)) {
      const filePath = `output_${index}.webp`;
      await writeFile(filePath, item);
      savedFiles.push(filePath);
    }

    console.log("Generated images saved:", savedFiles);
    res.json({ message: 'Images generated successfully', files: savedFiles });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
