const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS to allow external services (like Make.com) to access your API
app.use(cors());

// Middleware to parse JSON body (if needed)
app.use(express.json());

// Basic route to test the API
app.get('/', (req, res) => {
    res.send('API is running! Access /api/time to get the current time.');
});

// API endpoint to get current date and time
app.get('/api/time', (req, res) => {
    const now = new Date().toLocaleString();
    res.json({ message: "Hello!", currentDateTime: now });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
