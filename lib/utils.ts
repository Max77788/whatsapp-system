import { MongoClient, Db } from "mongodb";

// Database configuration
const DATABASE_NAME = process.env.DATABASE_NAME || "whatsappSystem";
const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
}

let clientPromise: Promise<MongoClient> | null = null;
let dbPromise: Promise<Db> | null = null;

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

const { getClient, getDb } = initializeMongo();

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
        }

        return false;
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
