const qrcode = require('qrcode-terminal');
require('dotenv').config();

const { MessageMedia } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const fs = require('fs');
const Jimp = require('jimp');

const { Client, RemoteAuth, LocalAuth } = require('whatsapp-web.js');

const customMessageHandler = (msg) => {
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

function setupClientEventHandlers(client, order) {
    client.on('ready', () => {
        console.log(`Client ${order} is ready!`);
    });

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log(`QR code for client ${order}: ${qr}`);
        
        const filePath = `qr_code_${order}.png`;
        const imageName = `QR Code for Client ${order}`;

        QRCode.toFile(filePath, qr, async (err) => {
            if (err) throw err;
            console.log('QR code saved as', filePath);
        
            try {
                // Import Jimp and load the font
                const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK); // Await font loading
        
                // Read the QR code image
                const image = await Jimp.read(filePath);
        
                // Calculate text dimensions
                const textWidth = Jimp.measureText(font, imageName);
                const textHeight = Jimp.measureTextHeight(font, imageName, textWidth);
        
                // Resize the image canvas to accommodate the text at the bottom
                image.contain(image.bitmap.width, image.bitmap.height + textHeight + 10);
        
                // Add the text at the bottom center of the image
                image.print(
                    font,
                    (image.bitmap.width - textWidth) / 2, // Center the text horizontally
                    image.bitmap.height - textHeight - 5, // Position the text above the bottom
                    imageName
                );
        
                // Save the updated image with the text overlay
                await image.writeAsync(filePath);
                console.log(`Image saved with text overlay as ${filePath}`);
            } catch (error) {
                console.error("Error processing image:", error);
            }
        });
        
        console.log(`QR code image name: ${filePath}`);
    });

    client.on('message', async (msg) => {
        console.log("Message received:", msg.body);
        const replyContent = customMessageHandler(msg);
        if (replyContent) {
            msg.reply(replyContent);
            // client.sendMessage(msg.from, replyContent);
        } else {
            msg.reply('I don\'t know what to say');
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
