const qrcode = require('qrcode-terminal');
require('dotenv').config();

const { MessageMedia } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const fs = require('fs');
const axios = require('axios');

const { Client, RemoteAuth, LocalAuth } = require('whatsapp-web.js');

const UNIQUE_ID = process.env.ACCOUNT_UNIQUE_ID;
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

const customMessageHandler = (msg) => {
    // pulled from user's acc in production
    if (msg.body === 'Hey!') {
        return 'Yo, amigo!';
    } else if (msg.body.toLowerCase().includes("piu!")) {
        return 'Pau!';
    } else {
        return null;
    }
}


const client1 = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one"
    }),
    puppeteer: {
        // executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

const client2 = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-two"
    }),
    puppeteer: {
        // executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

const client3 = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-three"
    }),
    puppeteer: {
        // executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

const client4 = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-four"
    }),
    puppeteer: {
        // executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

const client5 = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-five"
    }),
    puppeteer: {
        // executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client1.initialize();
client2.initialize();
client3.initialize();
client4.initialize();
client5.initialize();

function setupClientEventHandlers(client, order, UNIQUE_ID=null) {
    client.on('ready', () => {
        axios.post(`${APP_BASE_URL}/api/whatsapp-part/attach-phone`, {
            unique_id: UNIQUE_ID,
            phone_number: client.info.wid.user
        }).then((res) => {
            console.log(res.data);
        }).catch((err) => {
            console.log(err);
        });
        console.log(`Client ${order} is ready!`);
    });

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log(`QR code for client ${order}: ${qr}`);
        
        const filePath = `qr_code_${order}.png`;
        const imageName = `QR Code for Client ${order}`;

        // REMOVE THE IMAGE GENERATION AND SIMPLY DYNAMICALLY SEND QR CODE IN DATABASE
        axios.post(`${APP_BASE_URL}/api/whatsapp-part/qr-code-update`, {
            qrCode: qr,
            uniqueId: UNIQUE_ID,
            clientId: order
        }).then((res) => {
            console.log(res.data);
        }).catch((err) => {
            console.log(err);
        });

        QRCode.toFile(filePath, qr, async (err) => {
            if (err) throw err;
            axios
        });
        
        console.log(`QR code image name: ${filePath}`);
    });

    client.on('message', async (msg) => {
        console.log("Message received:", msg.body);
        const replyContent = customMessageHandler(msg);
        if (replyContent) {
            // msg.reply(replyContent);
            client.sendMessage(msg.from, replyContent);
        } else {
            client.sendMessage(msg.from, 'I don\'t know what to say');
        }
    });

    client.on('auth_failure', (message) => {
        console.error(`Authentication failed for client ${order}:`, message);
    });

    client.on('disconnected', (reason) => {
        console.log(`Client ${order} was disconnected:`, reason);
        const filePath = `qr_code_${order}.png`;
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting QR code image for client ${order}:`, err);
                } else {
                    console.log(`QR code image for client ${order} deleted successfully`);
                }
            });
        }
    });

    client.on('reconnecting', () => {
        console.log(`Client ${order} is reconnecting...`);
    });

    client.on('remote_session_saved', () => {
        console.log(`Session data for client ${order} has been updated and saved to MongoDB`);
    });
}

setupClientEventHandlers(client1, 1);
setupClientEventHandlers(client2, 2);
setupClientEventHandlers(client3, 3);
setupClientEventHandlers(client4, 4);
setupClientEventHandlers(client5, 5);
