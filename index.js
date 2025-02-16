import Replicate from "replicate";
import { writeFile } from "node:fs/promises";

// Initialize the Replicate client
const replicate = new Replicate();

// Define input image URL and scale factor
const input = {
    image: "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg", // Replace with the desired image URL
    scale: 2
};

// Create a prediction and get the prediction ID
const prediction = await replicate.predictions.create({
    version: "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
    input
});

// Poll the prediction until it is completed
let status = prediction.status;

while (status !== "succeeded" && status !== "failed") {
    // Wait for a while before checking the status again (polling)
    console.log("Waiting for prediction to finish...");
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    const updatedPrediction = await replicate.predictions.get(prediction.id);
    status = updatedPrediction.status;
}

if (status === "succeeded") {
    // Retrieve the output URL from the prediction response
    const outputImageURL = prediction.output;
    console.log("Prediction successful! Image URL:", outputImageURL);

    // Optional: Download the image and save it locally
    const imageBuffer = await fetch(outputImageURL).then(res => res.buffer());
    await writeFile("output.png", imageBuffer);
    console.log("Image saved as output.png");
} else {
    console.error("Prediction failed");
}
