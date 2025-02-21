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

// Middleware to parse JSON bodies safely
app.use(express.json({ strict: true, limit: '5mb' }));

// Global error handler for JSON parsing issues
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next();
});

// Endpoint to generate an image
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const output = await replicate.run(
      "stability-ai/stable-diffusion-3.5-large",
      { input: { prompt } }
    );

    if (!output || output.length === 0) {
      return res.status(500).json({ error: 'No image generated' });
    }

    // Save generated image
    const filePath = path.join(__dirname, 'output_0.webp');
    await writeFile(filePath, output[0]);

    console.log("Generated image saved:", filePath);

    // Send image response
    res.setHeader('Content-Type', 'image/webp');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to upscale and compress images
app.post('/upscale-image', async (req, res) => {
  const { image, scale } = req.body;

  if (!image || !scale) {
    return res.status(400).json({ error: 'Image URL and scale factor are required' });
  }

  try {
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input: { image, scale } }
    );

    if (!output) {
      return res.status(500).json({ error: 'Error upscaling image' });
    }

    // Fetch and compress the image
    const imageBuffer = await fetch(output).then(res => res.arrayBuffer());
    const compressedImage = await sharp(Buffer.from(imageBuffer))
      .jpeg({ quality: 80 })
      .toBuffer();

    const compressedFilePath = path.join(__dirname, 'compressed-output.jpg');
    await writeFile(compressedFilePath, compressedImage);

    console.log("Compressed output saved to:", compressedFilePath);

    // Send compressed image
    res.download(compressedFilePath, 'upscaled-compressed-image.jpg');
  } catch (error) {
    console.error('Error during processing:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🆕 New endpoint: Analyze image and respond with text
app.post('/analyze-image', async (req, res) => {
  const { image, prompt } = req.body;

  if (!image || !prompt) {
    return res.status(400).json({ error: 'Image URL and prompt are required' });
  }

  try {
    const input = { image, prompt };
    let responseText = '';

    for await (const event of replicate.stream(
      "yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb",
      { input }
    )) {
      responseText += event;
    }

    res.json({ response: responseText.trim() });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
