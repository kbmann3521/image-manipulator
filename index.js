// index.js

const Replicate = require("replicate");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp"); // Used for resizing and compressing images
const axios = require("axios");

const replicate = new Replicate({
  auth: "r8_JZKSFowZllejfsULUalBZQOSlXdfSgQ4fNtaV", // Directly using the API token
});

const inputImagePath = "path/to/your/input/image.jpg"; // Path to your image

async function upscaleAndResizeImage() {
  try {
    // Step 1: Upload image to Replicate for upscaling
    const imageUrl = await uploadImage(inputImagePath); // Upload image to a server

    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa", 
      {
        input: {
          image: imageUrl, // URL of the image to upscale
          scale: 2, // 2x upscale
        }
      }
    );
    
    console.log("Upscaled Image URL: ", output);

    // Step 2: Download the upscaled image
    const upscaledImageUrl = output; // Get the URL of the upscaled image
    const upscaledImageBuffer = await axios.get(upscaledImageUrl, { responseType: "arraybuffer" });

    // Step 3: Resize and compress the image using sharp
    const resizedImagePath = path.join(__dirname, "resized_compressed_image.jpg");
    await sharp(upscaledImageBuffer.data)
      .resize(800, 800) // Resize to 800x800 (adjust as necessary)
      .jpeg({ quality: 80 }) // Compress the image to 80% quality
      .toFile(resizedImagePath);

    console.log("Image has been resized and compressed:", resizedImagePath);

  } catch (error) {
    console.error("Error processing image:", error);
  }
}

// Helper function to upload image to a server (e.g., Cloud storage or your server)
async function uploadImage(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    // Upload the image to your server or cloud storage, and return the URL
    // This is a placeholder, replace with actual upload code
    const uploadedImageUrl = "https://your-server-url.com/path-to-image";
    return uploadedImageUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// Run the function
upscaleAndResizeImage();
