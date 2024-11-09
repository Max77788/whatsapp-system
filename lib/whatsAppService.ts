// lib/whatsappService.js

const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const client = new Client();

client.on('qr', (qr: any) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

client.on('message', (msg: any) => {
    if (msg.body.includes('!ping')) {
        msg.reply('pong');
    }
});

client.initialize();

module.exports = client;
