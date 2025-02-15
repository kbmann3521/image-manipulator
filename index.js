const Replicate = require("replicate");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const axios = require("axios");

const replicate = new Replicate({
  auth: 'r8_9HGPhGJozVbFy5a9Qhc8UAuXgnNSMAn2b9uY6', // Your Replicate API key
});

const upscaleImage = async (imageUrl) => {
  try {
    // Step 1: Upscale the image using Replicate API
    const input = {
      image: imageUrl,
      scale: 2, // Upscale 2x
    };

    const modelVersion = "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa"; // Adjust model version accordingly
    const output = await replicate.run(modelVersion, { input });

    // Step 2: Save the upscaled image to a local file (temporary)
    const outputFile = path.join(__dirname, 'upscaled-image.png');
    const writer = fs.createWriteStream(outputFile);
    const response = await axios({ url: output, responseType: 'stream' });
    response.data.pipe(writer);

    // Wait for file to be written
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log('Upscaled image saved successfully at:', outputFile);
    
    // Step 3: Resize and compress the image using sharp
    const compressedFilePath = path.join(__dirname, 'compressed-image.jpg');
    await sharp(outputFile)
      .resize(800) // Resize to width of 800px (adjust as needed)
      .jpeg({ quality: 80 }) // Compress to 80% quality
      .toFile(compressedFilePath);

    console.log('Resized and compressed image saved at:', compressedFilePath);

    // Return the final path
    return compressedFilePath;
  } catch (error) {
    console.error("Error in image processing:", error);
    throw error;
  }
};

// Example Usage: Upscaling and compressing an image from a URL
const imageUrl = 'https://example.com/your-image.jpg'; // Replace with your actual image URL
upscaleImage(imageUrl)
  .then((finalImagePath) => {
    console.log('Final image path:', finalImagePath);
  })
  .catch((err) => {
    console.error("Error:", err);
  });
