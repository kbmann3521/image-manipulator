const express = require('express');
const Replicate = require('replicate');
const { writeFile } = require('fs/promises');
const sharp = require('sharp');
const multer = require('multer');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000; // Default to port 3000

// Initialize replicate with the API key from environment variable
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // API key from GitHub Secrets or environment variables
});

// Multer middleware for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to parse JSON bodies
app.use(express.json());

// Define the endpoint to upscale and compress images
app.post('/upscale-image', upload.single('image'), async (req, res) => {
  const { scale, image } = req.body;
  const imageBuffer = req.file?.buffer;

  if (!imageBuffer && !image) {
    return res.status(400).send('Either an image file or an image URL is required');
  }

  if (!scale) {
    return res.status(400).send('Scale factor is required');
  }

  try {
    let base64Image;

    if (imageBuffer) {
      // Convert the binary image to base64
      base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    } else {
      // Use the provided image URL
      base64Image = image;
    }
    
    const input = { image: base64Image, scale };

    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      { input }
    );

    // Fetch the upscaled image
    const imageResponse = await fetch(output);
    const upscaledBuffer = await imageResponse.arrayBuffer();

    // Compress the image using sharp
    const compressedImage = await sharp(Buffer.from(upscaledBuffer))
      .jpeg({ quality: 80 }) // Adjust quality as needed
      .toBuffer();

    await writeFile("compressed-output.jpg", compressedImage);
    console.log("Compressed output saved to compressed-output.jpg");

    // Send the compressed image as a download
    res.download('compressed-output.jpg', 'upscaled-compressed-image.jpg');
  } catch (error) {
    console.error('Error during processing:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
