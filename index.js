import Replicate from 'replicate';
import { writeFile } from 'node:fs/promises';

async function runReplicate() {
  // Initialize Replicate API client
  const replicate = new Replicate();

  // Input data for the model
  const input = {
    image: "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg", // URL of the image
    scale: 2 // Example scale factor
  };

  try {
    // Run the model
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa", // Model identifier
      { input }
    );

    // Save the output to a file
    await writeFile("output.png", output);
    console.log('Output saved to output.png');
  } catch (error) {
    console.error('Error during Replicate API call:', error);
  }
}

// Execute the function
runReplicate();
