const Replicate = require('replicate');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from GitHub Secrets or environment variables
});

const input = {
  image: "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg",
  scale: 2,
};

const prediction = await replicate.predictions.create({
  version: 'f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
  input: input,
});

console.log('Prediction created:', prediction.id);  // Log prediction ID for reference

// Wait until the prediction is completed
let predictionStatus = await replicate.predictions.get(prediction.id);

// Fetch the status until it is completed or succeeded
while (predictionStatus.status !== 'completed' && predictionStatus.status !== 'succeeded') {
  console.log(`Waiting for prediction to complete... Current status: ${predictionStatus.status}`);
  await new Promise(resolve => setTimeout(resolve, 5000));  // Wait 5 seconds before polling again
  predictionStatus = await replicate.predictions.get(prediction.id);
}

// Once the prediction is completed, inspect the full status
console.log('Prediction Status:', predictionStatus);  // Log the entire status object

if (predictionStatus.status === 'succeeded' || predictionStatus.status === 'completed') {
  console.log('Prediction succeeded!');
  console.log('Output data:', predictionStatus.output); // This should be the image URL or binary data
} else {
  console.log('Prediction failed or didn\'t complete.');
}
