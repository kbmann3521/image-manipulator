const express = require('express');
const Replicate = require('replicate');
const { writeFile } = require('fs/promises');
const sharp = require('sharp');
const path = require('path');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Initialize Replicate with API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to generate an image
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).send('Prompt is required');
  }

  const input = { prompt };

  try {
    const output = await replicate.run(
      "stability-ai/stable-diffusion-3.5-large",
      { input }
    );

    if (!output || output.length === 0) {
      return res.status(500).send('No image generated');
    }

    // Save the first generated image to disk
    const filePath = path.join(__dirname, 'output_0.webp');
    await writeFile(filePath, output[0]);

    console.log("Generated image saved:", filePath);

    // Send the image file as response
    res.setHeader('Content-Type', 'image/webp');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to upscale and compress images
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

    if (!output) {
      return res.status(500).send('Error upscaling image');
    }

    // Fetch the upscaled image
    const imageBuffer = await fetch(output).then(res => res.arrayBuffer());

    // Compress the image using sharp
    const compressedImage = await sharp(Buffer.from(imageBuffer))
      .jpeg({ quality: 80 }) // Adjust quality as needed
      .toBuffer();

    const compressedFilePath = path.join(__dirname, 'compressed-output.jpg');
    await writeFile(compressedFilePath, compressedImage);

    console.log("Compressed output saved to:", compressedFilePath);

    // Send the compressed image as a download
    res.download(compressedFilePath, 'upscaled-compressed-image.jpg');
  } catch (error) {
    console.error('Error during processing:', error);
    res.status(500).send('Internal Server Error');
  }
});

// New endpoint to analyze an image
app.post('/analyze-image', async (req, res) => {
  const { image, prompt } = req.body;

  if (!image || !prompt) {
    return res.status(400).send('Image URL and prompt are required');
  }

  const input = { image, prompt, top_p: 1, max_tokens: 1024, temperature: 0.2 };

  try {
    const output = await replicate.run(
      "yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb",
      { input }
    );

    if (!output) {
      return res.status(500).send('Error analyzing image');
    }

    // Send the analysis result as response
    res.json({ analysis: output });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(Server running on http://localhost:${port});
});
