const qrcode = require('qrcode-terminal');
require('dotenv').config();

const { MessageMedia } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const { Client, RemoteAuth } = require('whatsapp-web.js');

const customMessageHandler = (msg) => {
    if (msg.body === 'Hey!') {
        return 'Yo, amigo!';
    } else if (msg.body.toLowerCase().includes("piu!")) {
        return 'Pau!';
    } else {
        return null;
    }
}

let store, client;

const MONGO_URI = process.env.MONGODB_URI;

export default async function startWhatsAppClient(uniqueId) {
mongoose.connect(MONGO_URI).then(() => {
    store = new MongoStore({ mongoose: mongoose });
    client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        }),
        puppeteer: {
            // executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
    });

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        console.log('Connected phone number:', client.info.wid.user);

        // Add message and other event listeners after client is fully initialized
        addEventListeners();
    });

    client.on('auth_failure', (message) => {
        console.error('Authentication failed:', message);
    });

    client.on('disconnected', (reason) => {
        console.log('Client was disconnected:', reason);
    });

    client.on('reconnecting', () => {
        console.log('Client is reconnecting...');
    });

    client.on('remote_session_saved', () => {
        console.log('Session data has been updated and saved to MongoDB');
    });

    client.initialize();
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Function to add event listeners
const addEventListeners = () => {
    // Listen for incoming messages
    client.on('message', async (msg) => {
        console.log("Message received:", msg.body);
        const reply = customMessageHandler(msg);
        if (reply) {
            msg.reply(reply);
        } else {
            msg.reply('I don\'t know what to say');
        }
    });
    console.log("Added event listeners");
}
}
