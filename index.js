const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sharp = require('sharp');
const Replicate = require('replicate');

const app = express();
const PORT = process.env.PORT || 3000;

// Get Replicate API token from environment variable
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Initialize Replicate client
const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
});

// Enable CORS
app.use(cors());

// Middleware to parse JSON body
app.use(express.json());

// API to fetch, upscale, resize, and compress an image from a URL
app.post('/api/compress-image', async (req, res) => {
    try {
        const { imageUrl, width, height, quality } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "Image URL is required." });
        }

        // Set default quality if not provided
        const finalQuality = quality || 100;

        // Fetch image from URL
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        // Step 1: Upscale the image 10x using Replicate's Real-ESRGAN model
        const input = {
            image: response.data, // Image fetched from URL
            scale: 10, // Upscaling factor
        };

        const output = await replicate.run(
            "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa", 
            { input }
        );

        // The output is a URL to the upscaled image (Replicate returns a URL for the image)
        const upscaledImageUrl = output;

        // Fetch the upscaled image from Replicate
        const upscaledImageResponse = await axios.get(upscaledImageUrl, { responseType: 'arraybuffer' });

        // Step 2: Resize and compress the image using sharp
        const processedImage = await sharp(upscaledImageResponse.data)
            .resize({
                width: Math.min(width || 12000, 12000),
                height: Math.min(height || 12000, 12000),
                fit: 'inside',
                kernel: 'lanczos3',
            })
            .jpeg({ quality: finalQuality, progressive: true, optimizeScans: true })
            .toBuffer();

        // Set response headers and send the processed image
        res.set('Content-Type', 'image/jpeg');
        res.send(processedImage);
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Failed to process the image.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
