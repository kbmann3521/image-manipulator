const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Sample API endpoint
app.get('/api/time', (req, res) => {
    const now = new Date().toLocaleString();
    res.json({ message: "Hello!", currentDateTime: now });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
