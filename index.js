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

        // Fetch image from URL
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        // Process image with sharp
        const processedImage = await sharp(response.data)
            .resize(width || 800, height || 800, { fit: 'inside' }) // Default to 800px max
            .jpeg({ quality: quality || 80 }) // Default quality to 80%
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
    console.log(`Server is running on port ${PORT}`);
});
