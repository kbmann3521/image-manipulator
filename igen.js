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

// Middleware to parse JSON bodies
app.use(express.json());

// POST endpoint to run the model
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

    console.log('Output:', output);

    // If the output is an array of URLs or strings, handle it directly
    if (Array.isArray(output)) {
      for (const [index, url] of output.entries()) {
        // Save the image directly from the URL (assuming it's the correct format)
        await writeFile(`output_${index}.webp`, url); // Saves the image file as a .webp
      }
    } else {
      res.status(500).send('Invalid output format from model');
      return;
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
