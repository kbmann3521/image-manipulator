const https = require('https');

// Make sure to replace this with your actual API key.
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

async function makePrediction() {
  // Step 1: Create prediction
  const options = {
    hostname: 'api.replicate.com',
    path: '/v1/predictions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    }
  };

  const data = JSON.stringify({
    version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
    input: {
      image: "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg",
      scale: 1,
      face_enhance: false
    }
  });

  let predictionId = null;
  let status = 'starting';

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', async () => {
      if (response.statusCode === 201) {
        const prediction = JSON.parse(data);
        predictionId = prediction.id;
        status = prediction.status;
        console.log("Prediction created, waiting for result...");
      } else {
        console.error('Error creating prediction:', data);
        return;
      }
      
      // Step 2: Polling loop for result
      while (status !== "succeeded" && status !== "failed") {
        console.log("Waiting for image processing...");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        const pollOptions = {
          hostname: 'api.replicate.com',
          path: `/v1/predictions/${predictionId}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_KEY}`,
          }
        };

        https.request(pollOptions, (pollResponse) => {
          let pollData = '';
          pollResponse.on('data', (chunk) => {
            pollData += chunk;
          });

          pollResponse.on('end', () => {
            const prediction = JSON.parse(pollData);
            status = prediction.status;
            if (status === "succeeded") {
              console.log("Full JSON response:", JSON.stringify(prediction, null, 2));
            } else if (status === "failed") {
              console.error("Model failed to process the image.");
            }
          });
        }).end();
      }
    });
  });

  request.on('error', (error) => {
    console.error('Error:', error);
  });

  request.write(data);
  request.end();
}

makePrediction();
