const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON body
app.use(express.json());

// API to fetch, resize, and compress an image from a URL
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

        // Process image with sharp (using Lanczos for resampling, lossless compression)
        const processedImage = await sharp(response.data)
            .resize({
                width: Math.min(width || 12000, 12000),
                height: Math.min(height || 12000, 12000),
                fit: 'inside', // Ensure the image fits within the max dimensions
                kernel: 'lanczos3', // Use Lanczos3 resampling
            })
            .jpeg({ quality: finalQuality, progressive: true, optimizeScans: true }) // Lossless compression for JPEG
            .toBuffer();

        // Set response headers
        res.set('Content-Type', 'image/jpeg');
        res.send(processedImage);
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Failed to process the image.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(Server is running on port ${PORT});
});
