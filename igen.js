const express = require('express');
const Replicate = require('replicate');
const { writeFile } = require('fs/promises');
const fetch = require('node-fetch'); // Ensure 'fetch' is available for downloading images

// Initialize express app
const app = express();
const port = process.env.PORT || 3000; // Default to port 3000

// Initialize replicate with the API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from environment variables
});

// Middleware to parse JSON bodies
app.use(express.json());

// Define the endpoint to generate and save images
app.post('/generate-image', async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).send('Input prompt is required');
  }

  try {
    const output = await replicate.run(
      "stability-ai/stable-diffusion-3.5-large", 
      { input }
    );

    // Log the output to inspect its structure
    console.log(output);

    // Check if output is valid
    if (!output || output.length === 0) {
      return res.status(500).send('No output received from the model');
    }

    // Fetch and save the generated image(s)
    for (const [index, url] of Object.entries(output)) {
      const imageBuffer = await fetch(url).then(res => res.buffer());
      await writeFile(`output_${index}.webp`, imageBuffer);
    }

    res.status(200).send('Images generated and saved successfully!');
  } catch (error) {
    console.error('Error during processing:', error);
    res.status(500).send('Error generating image: ' + error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
