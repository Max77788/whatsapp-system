import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // For webhook verification challenge
    if (req.method === 'GET') {
        const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.status(403).end();
        }
        return;
    }

    // Handle incoming message
    if (req.method === 'POST') {
        try {
            const data = req.body;
            console.log('📩 Incoming Message:', JSON.stringify(data, null, 2));

            // Store message in your database here

            res.status(200).send('EVENT_RECEIVED');
        } catch (error) {
            console.error('Error handling incoming WhatsApp message:', error);
            res.status(500).send('Error');
        }
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
