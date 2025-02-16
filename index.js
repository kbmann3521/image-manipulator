const express = require('express');
const replicate = require('replicate');
const bodyParser = require('body-parser');

// Initialize Express and Replicate
const app = express();
const port = 3000;

// Body parser to handle JSON body for webhook
app.use(bodyParser.json());

// Replicate instance
const replicateInstance = replicate({
  auth: 'YOUR_REPLICATE_API_KEY',
});

// Webhook endpoint that will receive the update from Replicate
app.post('/webhooks/replicate', (req, res) => {
  const predictionData = req.body;

  // Handle the received prediction data here
  console.log('Prediction update received:', predictionData);

  // You can check prediction status here, and act accordingly
  if (predictionData.status === 'completed') {
    // Handle when the prediction is completed, e.g., save result, notify user, etc.
    console.log('Prediction completed!', predictionData.output);
  } else if (predictionData.status === 'failed') {
    console.log('Prediction failed');
  }

  // Respond with a success message to acknowledge receipt of the webhook
  res.status(200).send('Webhook received successfully');
});

// Route to initiate the image manipulation request
app.post('/upscale-image', async (req, res) => {
  const { image, scale } = req.body;

  if (!image || !scale) {
    return res.status(400).send('Image URL and scale factor are required');
  }

  const input = { image, scale };
  const callbackURL = `http://localhost:${port}/webhooks/replicate`;

  try {
    // Create the prediction, passing the webhook URL and the events to be tracked
    const prediction = await replicateInstance.predictions.create({
      version: 'f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
      input: input,
      webhook: callbackURL,
      webhook_events_filter: ['completed'], // Only listen for "completed" events
    });

    console.log('Prediction created:', prediction);

    // Respond with prediction details to the user (you could give a job ID or status)
    res.status(202).send({ message: 'Prediction started', predictionId: prediction.id });
  } catch (error) {
    console.error('Error creating prediction:', error);
    res.status(500).send('Error starting prediction');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
