const Replicate = require("replicate");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from GitHub Secrets or environment variables
});

(async () => {
  try {
    let prediction = await replicate.predictions.create({
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      input: {
        image: "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg",
        scale: 1,
        face_enhance: false
      }
    });

    // Polling loop to check the status
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      console.log("Waiting for image processing...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      prediction = await replicate.predictions.get(prediction.id); // Update the prediction status
    }

    if (prediction.status === "succeeded") {
      console.log("Upscaled Image URL:", prediction.output);
    } else {
      console.error("Model failed to process the image.");
    }
  } catch (error) {
    console.error("Error running model:", error);
  }
})();
