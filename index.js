const express = require('express');
const Replicate = require('replicate');
const fetch = require('node-fetch'); // Ensure fetch is available for Node.js

// Initialize replicate with the API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from GitHub Secrets or environment variables
});

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Define the endpoint to upscale and compress images
app.post('/upscale-image', async (req, res) => {
  const { image, scale } = req.body;

  if (!image || !scale) {
    return res.status(400).send('Image URL and scale factor are required');
  }

  const input = { image, scale };

  try {
    // Start the Replicate prediction
    let prediction = await replicate.predictions.create({
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b", // The model version
      input: input
    });

    // Polling loop to check the status of the prediction
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      console.log("Waiting for image processing...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      prediction = await replicate.predictions.get(prediction.id); // Update the prediction status
    }

    if (prediction.status === "succeeded") {
      console.log("Full JSON response:", JSON.stringify(prediction, null, 2));
      // Send back the prediction result (image URL)
      res.json(prediction.output); // Or, modify this part to send the image URL directly
    } else {
      console.error("Model failed to process the image.");
      res.status(500).send('Model failed to process the image.');
    }
  } catch (error) {
    console.error("Error running model:", error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
