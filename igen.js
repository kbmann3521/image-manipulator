const express = require('express');
const Replicate = require('replicate');
const { writeFile } = require('fs/promises');
const fetch = require('node-fetch'); // Ensure this is installed

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Initialize replicate with the API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from environment variables
});

// Middleware to parse JSON requests
app.use(express.json());

// POST endpoint to generate image
app.post('/generate-image', async (req, res) => {
  try {
    // Define your input parameters
    const input = {
      prompt: "~*~aesthetic~*~ #boho #fashion, full-body 30-something woman laying on microfloral grass, candid pose, overlay reads Stable Diffusion 3.5, cheerful cursive typography font",
      cfg: 7.0,
      seed: Math.floor(Math.random() * 10000),
      steps: 40,
      aspect_ratio: "1:1",
      output_format: "webp",
      output_quality: 90,
      prompt_strength: 0.85,
    };

    // Run the model
    const output = await replicate.run("stability-ai/stable-diffusion-3.5-large", { input });

    // Fetch the generated image (assuming output is a URL or base64)
    const imageUrl = output[0]; // Adjust based on actual structure of output

    // Fetch the image data
    const response = await fetch(imageUrl);
    const imageBuffer = await response.buffer(); // Get image data as buffer

    // Save the image to disk
    await writeFile('output_image.webp', imageBuffer);

    res.status(200).send('Images generated and saved successfully!');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send('Error generating image');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
