import { MongoClient, Db } from "mongodb";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import axios from "axios";

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

export function extractSheetId(url: string): string {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
        throw new Error("Invalid Google Sheets URL. Please provide a valid URL.");
    }
    return match[1];
}

/**
 * Fetches the headers from a Google Sheet.
 * @param {string} url - The URL of the Google Sheet
 * @returns {Array<string>} - An array of headers
 */
export async function fetchGoogleSheetHeaders(url: string): Promise<string[]> {
    try {
        const sheetId = extractSheetId(url);
        const apiKey = process.env.GSHEETS_API_KEY;

        if (!apiKey) {
            throw new Error("Google Sheets API key is not set in process.env.GSHEETS_API_KEY");
        }

        // Google Sheets API endpoint
        const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;

        // Fetch data from the API
        const response = await axios.get(apiUrl);
        const { values } = response.data;

        if (!values || values.length === 0) {
            throw new Error("No data found in the sheet.");
        }

        // Extract headers
        const headers = values[0].map((header: string) => header.trim());

        return headers;
    } catch (error) {
        console.error("Error fetching Google Sheet headers:", error);
        return [];
    }
}

/**
 * Fetches all rows from a Google Sheet, filtering rows with invalid content.
 * @param {string} url - The URL of the Google Sheet
 * @param {string} nameColumn - The name of the column containing names
 * @param {string} phoneNumberColumn - The name of the column containing phone numbers
 * @returns {Array<Object>} - An array of rows as objects
 */
export async function fetchGoogleSheetRows(url: string, nameColumn: string, phoneNumberColumn: string): Promise<{ name: string; phone_number: string; }[]> {
    try {
        const sheetId = extractSheetId(url);
        const apiKey = process.env.GSHEETS_API_KEY;

        if (!apiKey) {
            throw new Error("Google Sheets API key is not set in process.env.GSHEETS_API_KEY");
        }

        // Google Sheets API endpoint
        const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;

        // Fetch data from the API
        const { data: { values } } = await axios.get(apiUrl);

        if (!values || values.length === 0) {
            throw new Error("No data found in the sheet.");
        }

        // Extract headers
        const headers = values[0].map((header: string) => header.trim());

        // Find indices for the specified columns
        const nameIndex = headers.indexOf(nameColumn);
        const phoneNumberIndex = headers.indexOf(phoneNumberColumn);

        if (nameIndex === -1 || phoneNumberIndex === -1) {
            throw new Error("Specified column names not found in the sheet.");
        }

        // Extract name and phone number data
        const data = values.slice(1).map((row: string[]) => ({
            name: row[nameIndex]?.trim() || "",
            phone_number: row[phoneNumberIndex]?.trim() || ""
        }));

        return data;
    } catch (error) {
        console.error("Error fetching Google Sheet data:", error);
        return [];
    }
}