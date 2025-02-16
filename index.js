const express = require('express');
const Replicate = require('replicate');
const { writeFile, readFile } = require('fs/promises');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000; // Default to port 3000 okay

// Initialize replicate with the API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from GitHub Secrets or environment variables
});

// Middleware to parse JSON bodies
app.use(express.json());

// Define the endpoint to upscale and get raw JSON output
app.post('/upscale-image', async (req, res) => {
  const { image, scale } = req.body;

  if (!image || !scale) {
    return res.status(400).send('Image URL and scale factor are required');
  }

  const input = { image, scale };

  try {
    // Run the prediction with the provided input
    const prediction = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // The prediction will return the raw JSON output, which may contain various details
    console.log(prediction); // Log the entire JSON output for debugging

    // Send the raw JSON as the response
    res.json(prediction);
  } catch (error) {
    console.error('Error during processing:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
