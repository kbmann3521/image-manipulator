const express = require('express');
const Replicate = require('replicate');
const { writeFile } = require('fs/promises');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000; // Default to port 3000

// Initialize replicate with the API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from environment variables
});

// Middleware to parse JSON requests
app.use(express.json());

// POST endpoint to run the model
app.post('/generate-image', async (req, res) => {
  try {
    const input = req.body.input || {
      prompt: "A futuristic cyberpunk city at night, neon lights reflecting on rainy streets, ultra-detailed, cinematic lighting",
    };

    // Run the model
    const output = await replicate.run("stability-ai/stable-diffusion-3.5-large", { input });

    // Check if output is valid
    if (!output || output.length === 0) {
      return res.status(500).send('No output received from the model.');
    }

    // Save the generated image(s) to disk
    for (const [index, url] of Object.entries(output)) {
      await writeFile(`output_${index}.webp`, url);
    }

    res.status(200).send('Images generated and saved successfully!');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send('Error generating image');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
