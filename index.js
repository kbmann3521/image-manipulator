const express = require('express');
const app = express();
const port = 3000; // You can change this if needed

app.get('/api/datetime', (req, res) => {
    const now = new Date();
    res.json({ datetime: now.toLocaleString() });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
