import Replicate from "replicate";
import { writeFile } from "node:fs/promises";

// Initialize Replicate instance with your API token
const replicate = new Replicate({
  auth: "r8_JmA8oO0W7PkTdHO0v4wWnWmNEThahuB1yXtqn", // Your Replicate API token
});

// Function to run the model
const runModel = async () => {
  try {
    // Input for the model (image URL and scale)
    const input = {
      image: "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg",
      scale: 2,
    };

    // Run the model
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Write the output to a file
    await writeFile("output.png", output);

    console.log("Output image saved as output.png");

  } catch (error) {
    console.error("Error running the model:", error);
  }
};

// Call the function to run the model
runModel();
