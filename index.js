require("dotenv").config();
const express = require("express");
const Replicate = require("replicate");
const axios = require("axios");
const { writeFile } = require("fs/promises");
const path = require("path");

const app = express();
const port = 3000; // Change if needed
const replicate = new Replicate();

// Middleware to parse JSON body
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
        const output = await replicate.run(
            "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
            { input }
        );

        console.log("Image upscaled successfully. Downloading...");

        // Download the upscaled image
        const response = await axios.get(output, { responseType: "arraybuffer" });

        // Save the image to the server (optional)
        const outputPath = path.join(__dirname, "output.png");
        await writeFile(outputPath, response.data);

        console.log("Upscaled image saved.");

        // Send the image URL or file as response
        res.json({ success: true, upscaledImageUrl: output });

    } catch (error) {
        console.error("Error upscaling image:", error.message);
        res.status(500).json({ error: "Failed to upscale image." });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
