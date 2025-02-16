const express = require('express');
const replicate = require('replicate');
const app = express();
const port = 3000;

// Initialize Replicate client with your API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from GitHub Secrets or environment variables
});

// Input data for the prediction
const input = {
    image: "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg",
    scale: 2
};

// The callback URL for the webhook
const callbackURL = `https://phpstack-1409552-5253125.cloudwaysapps.com/webhooks/replicate`;

// Function to create a prediction
async function createPrediction() {
    try {
        const response = await replicateClient.predictions.create({
            version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa", // Replace with correct version
            input: input,
            webhook: callbackURL,
            webhook_events_filter: ["completed"],
        });

        console.log('Prediction created:', response);
    } catch (error) {
        console.error('Error creating prediction:', error);
    }
}

// Setup the webhook endpoint
app.post('/webhooks/replicate', express.json(), (req, res) => {
    const event = req.body;

    // Log the event data
    console.log('Webhook received:', event);

    // Respond with success
    res.status(200).send('Webhook received');
});

// Start the express server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);

    // Trigger the prediction creation
    createPrediction();
});
