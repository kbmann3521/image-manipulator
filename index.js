// index.js

const Replicate = require("replicate"); // Use CommonJS syntax
const { writeFile } = require("fs/promises");

async function upscaleAndProcessImage() {
  const input = {
    image: "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg",
    scale: 2,
  };

  try {
    const output = await replicate.run("nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa", { input });

    // Save the output
    await writeFile("output.png", output);
    console.log("Output saved to output.png");
  } catch (error) {
    console.error("Error during prediction:", error);
  }
}

upscaleAndProcessImage();
