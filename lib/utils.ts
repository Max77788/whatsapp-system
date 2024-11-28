import { MongoClient, Db } from "mongodb";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

// Database configuration
const DATABASE_NAME = process.env.DATABASE_NAME || "whatsappSystem";
const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
}

export let clientPromise: Promise<MongoClient> | null = null;
export let dbPromise: Promise<Db> | null = null;

/**
 * Initialize MongoClient and Database once
 */
const initializeMongo = (): { getClient: () => Promise<MongoClient>; getDb: () => Promise<Db> } => {
    if (!clientPromise) {
        clientPromise = MongoClient.connect(uri, { maxPoolSize: 75 });
    }

    if (!dbPromise) {
        dbPromise = clientPromise.then((client) => client.db(DATABASE_NAME));
    }

    const getClient = () => clientPromise!;
    const getDb = () => dbPromise!;

    return { getClient, getDb };
};

export const { getClient, getDb } = initializeMongo();

/**
 * Update User Utility
 */
export const update_user = async (
    filter: any,
    stuff_to_update: any,
    action: string = "$set"
): Promise<boolean> => {
    try {
        const db = await getDb();
        const userFound = await db.collection("users").findOne(filter);

        if (userFound) {
            const updateAction = { [action]: stuff_to_update };
            const options =
                action === "$set" || action === "$push" || action === "$addToSet"
                    ? { upsert: true }
                    : undefined;

            await db.collection("users").updateOne(filter, updateAction, options);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(`Error updating user: ${error}`);
        throw error;
    }
};

/**
 * Find User Utility
 */
export const find_user = async (filter: any): Promise<any> => {
    try {
        const db = await getDb();
        return await db.collection("users").findOne(filter);
    } catch (error) {
        console.error(`Error finding user: ${error}`);
        throw error;
    }
};

/**
 * Find QR ID by Phone Utility
 */
export const find_qr_id_by_phone = (user: any, phone_number: string) => {
    let clientId;
    let keyThing;
    for (let i = 1; i <= 5; i++) {
        const attr = `qrCode${i}`;
        if (user[attr] && user[attr].phoneNumber === phone_number) {
            keyThing = attr;
            clientId = i;
            return { clientId, keyThing };
        }
    }
    return { clientId: null, keyThing: null };
};

export const getAllUsersFromDatabase = async () => {
    const db = await getDb();
    const users = await db.collection("users").find().toArray();
    return users;
};


export const updateUserPassword = async (token: string, newPassword: string) => {
    const db = await getDb();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const resetToken = nanoid(10);

    await db.collection("users").updateOne({ reset_token: token }, { $set: { password: hashedPassword, reset_token: resetToken } });
};




export async function verifyApiKey(apiKey: string) {
    try {
        const db = await getDb();
        const user = await db.collection('users').findOne({ apiKey });

        return !!user; // Return true if the API key matches a user
    } catch (error) {
        console.error('Error verifying API key:', error);
        return false;
    }
}

export const getAllApiKeys = async () => {
    const db = await getDb();
    const apiKeys = await db.collection('users').find({ apiKey: { $exists: true } }).project({ apiKey: 1, _id: 0 }).toArray();
    return apiKeys.map(user => user?.apiKey);
}