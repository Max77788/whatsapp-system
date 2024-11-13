import { clientPromiseDb } from '@/lib/mongodb';

export default async function POST(req, res) {
    const { userEmail, messageLogicList } = req.body;

    const db = await clientPromiseDb;
    const userFound = await db.collection("users").findOne({ email: userEmail });

    if (userFound) {
        await db.collection("users").updateOne({ email: userEmail }, { $set: { messageLogic: messageLogicList } }, 
        {"upsert": true} );
    }

    return new Response(JSON.stringify({ message: `Message response logic saved successfully` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}