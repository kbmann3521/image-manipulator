const express = require('express');
const Replicate = require('replicate');
const { writeFile } = require('fs/promises');
const sharp = require('sharp');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Initialize replicate with the API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to run image generation (from your first script)
app.post('/run-image', async (req, res) => {
  try {
    const model = 'stability-ai/stable-diffusion-3.5-large:e6c4657fe1b3f078fb26d68a1413bc8013e2b085504dd84a33e26e16fb95a593';
    const input = {
      cfg: 4.5,
      steps: 40,
      prompt: req.body.prompt || '~*~aesthetic~*~ #boho #fashion, full-body 30-something woman laying on microfloral grass, candid pose, overlay reads Stable Diffusion 3.5, cheerful cursive typography font',
      aspect_ratio: '1:1',
      output_format: 'webp',
      output_quality: 90,
      prompt_strength: 0.85,
    };

    console.log('Using model:', model);
    console.log('With input:', input);
    console.log('Running...');

    const output = await replicate.run(model, { input });

    console.log('Done!', output);

    res.json({ success: true, output });
  } catch (error) {
    console.error('Error running the model:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to upscale and compress images (from your second script)
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
      .jpeg({ quality: 80 })
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
