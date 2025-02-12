// index.js - Simple Node.js Script

function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString();
}

console.log("Hello! The current date and time is:", getCurrentDateTime());
