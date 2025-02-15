const express = require('express');
const Replicate = require('replicate');
const { writeFile } = require('fs/promises');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000; // Default to port 3000

// Initialize replicate with the API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from GitHub Secrets or environment variables
});

// Middleware to parse JSON bodies
app.use(express.json());

// Define the endpoint to upscale images
app.post('/upscale-image', async (req, res) => {
  const { image, scale } = req.body;

  if (!image || !scale) {
    return res.status(400).send('Image URL and scale factor are required');
  }

  const input = {
    image,
    scale,
  };

  try {
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Save the output image to disk or send it as a response
    await writeFile("output.png", output);
    console.log("Output saved to output.png");

    // Optionally, send the result back as a download or as a URL
    res.download('output.png', 'upscaled-image.png');
  } catch (error) {
    console.error('Error during prediction:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
