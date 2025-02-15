import Replicate from 'replicate';
import { writeFile } from 'node:fs/promises';

async function runReplicate() {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY // Use the environment variable
  });

  const input = {
    image: "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg", 
    scale: 2
  };

  try {
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa", 
      { input }
    );

    await writeFile("output.png", output);
    console.log('Output saved to output.png');
  } catch (error) {
    console.error('Error during Replicate API call:', error);
  }
}

runReplicate();
