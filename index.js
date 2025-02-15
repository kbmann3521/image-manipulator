const express = require("express");
const Replicate = require("replicate");
const axios = require("axios");
const { writeFile } = require("fs/promises");
const path = require("path");

const app = express();
const port = 3000; // Change if needed

// Directly define the Replicate API key in the code
const replicate = new Replicate({
    auth: "r8_JmA8oO0W7PkTdHO0v4wWnWmNEThahuB1yXtqn" // Use your Replicate API key here
});

app.use(express.json());

app.post("/api/compress-image", async (req, res) => {
    try {
        const { imageUrl, scale } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "Missing imageUrl parameter." });
        }

        console.log(`Received request to upscale: ${imageUrl}`);

        // Define input for the model
        const input = {
            image: imageUrl,
            scale: scale || 2 // Default scale is 2
        };

        // Run the model on Replicate
        const prediction = await replicate.run(
            "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
            { input }
        );

        console.log("Prediction started. Checking status...");

        // Poll for the prediction status until it's finished
        let predictionStatus = "starting";
        let upscaledImageUrl = "";

        while (predictionStatus === "starting" || predictionStatus === "processing") {
            // Wait for a while before checking the status again
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const status = await replicate.predictions.get({ id: prediction.id });
            predictionStatus = status.status;
            upscaledImageUrl = status.output?.image_url || ""; // Adjust based on actual output structure
            console.log(`Prediction status: ${predictionStatus}`);

            // If the prediction is finished and has an image URL, exit the loop
            if (predictionStatus === "succeeded" && upscaledImageUrl) {
                break;
            }
        }

        if (!upscaledImageUrl) {
            return res.status(500).json({ error: "Image upscaling failed or the result is unavailable." });
        }

        console.log("Image upscaled successfully. Downloading...");

        // Download the upscaled image data directly as binary
        const response = await axios.get(upscaledImageUrl, { responseType: "arraybuffer" });

        // The response data is the image binary, which can be sent directly to your storage server
        const imageBuffer = Buffer.from(response.data);

        // You can upload this buffer to your storage server here.
        // For example, you can send the buffer to a cloud storage service.

        console.log("Upscaled image downloaded successfully.");

        // Send the image buffer in the response or handle it however you need
        res.setHeader('Content-Type', 'image/png');
        res.send(imageBuffer);

    } catch (error) {
        console.error("Error upscaling image:", error.message);
        res.status(500).json({ error: "Failed to upscale image." });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
