const express = require('express');
const Replicate = require('replicate');
const { writeFile } = require('fs/promises');

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
    const input = {
      prompt: "~*~aesthetic~*~ #boho #fashion, full-body 30-something woman laying on microfloral grass, candid pose, overlay reads Stable Diffusion 3.5, cheerful cursive typography font"
    };

    // Run the model
    const output = await replicate.run("stability-ai/stable-diffusion-3.5-large", { input });

    // Save the generated image(s) to disk
    for (const [index, item] of Object.entries(output)) {
      await writeFile(`output_${index}.webp`, item);
    }

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
