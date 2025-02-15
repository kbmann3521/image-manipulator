const axios = require('axios');

const url = 'https://api.replicate.com/v1/predictions';
const headers = {
    'Authorization': 'Bearer r8_JmA8oO0W7PkTdHO0v4wWnWmNEThahuB1yXtqn',
    'Content-Type': 'application/json',
    'Prefer': 'wait'
};

const data = {
    "version": "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
    "input": {
        "image": "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg",
        "scale": 2
    }
};

axios.post(url, data, { headers })
    .then(response => {
        console.log('Response:', response.data);
    })
    .catch(error => {
        console.error('Error:', error.response ? error.response.data : error.message);
    });
