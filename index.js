const express = require("express");
const Replicate = require("replicate");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const axios = require("axios");

const app = express();
app.use(express.json());

const replicate = new Replicate({
  auth: 'r8_JmA8oO0W7PkTdHO0v4wWnWmNEThahuB1yXtqn', // Your Replicate API key
});

// Function to upscale, resize, and compress the image
const upscaleImage = async (imageUrl) => {
  try {
    const input = {
      image: imageUrl,
      scale: 2,
    };

    const modelVersion = "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa";
    const output = await replicate.run(modelVersion, { input });

    const outputFile = path.join(__dirname, 'upscaled-image.png');
    const writer = fs.createWriteStream(outputFile);
    const response = await axios({ url: output, responseType: 'stream' });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const compressedFilePath = path.join(__dirname, 'compressed-image.jpg');
    await sharp(outputFile)
      .resize(800)
      .jpeg({ quality: 80 })
      .toFile(compressedFilePath);

    return compressedFilePath;
  } catch (error) {
    console.error("Error in image processing:", error);
    throw error;
  }
};

// Endpoint to handle incoming requests
app.post("/upscale", async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  try {
    const finalImagePath = await upscaleImage(imageUrl);
    res.status(200).json({ message: "Image processed successfully", finalImagePath });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while processing the image", details: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
