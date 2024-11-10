const express = require('express');
const startWhatsAppClient = require('./whatsAppClient');
const app = express();
const port = 5500;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/create-client/:uniqueId', (req, res) => {
    const { uniqueId } = req.params;
    startWhatsAppClient(uniqueId);
    res.send('Client created');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
