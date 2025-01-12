import { MongoClient, Db } from "mongodb";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import axios from "axios";
import { Resend } from "resend";

const countryCodes = [
    "+1", "+7", "+20", "+27", "+30", "+31", "+32", "+33", "+34", "+36", "+39", "+40", "+41", "+43", "+44", "+45", "+46", "+47", "+48", "+49",
    "+51", "+52", "+53", "+54", "+55", "+56", "+57", "+58", "+60", "+61", "+62", "+63", "+64", "+65", "+66", "+81", "+82", "+84", "+86", "+90",
    "+91", "+92", "+93", "+94", "+95", "+98", "+211", "+212", "+213", "+216", "+218", "+220", "+221", "+222", "+223", "+224", "+225", "+226",
    "+227", "+228", "+229", "+230", "+231", "+232", "+233", "+234", "+235", "+236", "+237", "+238", "+239", "+240", "+241", "+242", "+243",
    "+244", "+245", "+246", "+248", "+249", "+250", "+251", "+252", "+253", "+254", "+255", "+256", "+257", "+258", "+260", "+261", "+262",
    "+263", "+264", "+265", "+266", "+267", "+268", "+269", "+290", "+291", "+297", "+298", "+299", "+350", "+351", "+352", "+353", "+354",
    "+355", "+356", "+357", "+358", "+359", "+370", "+371", "+372", "+373", "+374", "+375", "+376", "+377", "+378", "+379", "+380", "+381",
    "+382", "+383", "+385", "+386", "+387", "+389", "+420", "+421", "+423", "+500", "+501", "+502", "+503", "+504", "+505", "+506", "+507",
    "+508", "+509", "+590", "+591", "+592", "+593", "+594", "+595", "+596", "+597", "+598", "+599", "+670", "+672", "+673", "+674", "+675",
    "+676", "+677", "+678", "+679", "+680", "+681", "+682", "+683", "+685", "+686", "+687", "+688", "+689", "+690", "+691", "+692", "+850",
    "+852", "+853", "+855", "+856", "+870", "+880", "+881", "+882", "+883", "+886", "+960", "+961", "+962", "+963", "+964", "+965", "+966",
    "+967", "+968", "+970", "+971", "+972", "+973", "+974", "+975", "+976", "+977", "+992", "+993", "+994", "+995", "+996", "+998"
  ]
;

export const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "contact@mom-ai-restaurant.lat";
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

export const getAllPlansFromDatabase = async () => {
    const db = await getDb();
    const plans = await db.collection("plans").find().sort({price: 1}).toArray();
    return plans;
};

export const getNumberOfActivePhones = async (user_email: string) => {
    const db = await getDb();
    const user = await db.collection("users").findOne({ email: user_email });
    let nonNullPhoneNumberCount = 0;
    for (let i = 1; i <= 5; i++) {
        let attr = `qrCode${i}`;
        if (user && user[attr] && user[attr].phoneNumber !== null) {
                nonNullPhoneNumberCount++;
        }
    }
    return nonNullPhoneNumberCount;
};

export const findPlanById = async (id: string) => {
    const db = await getDb();
    const plan = await db.collection("plans").findOne({ id: id });
    return plan;
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
    console.log(apiKeys);
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
        console.error("Error fetching Google Sheet headers:", JSON.stringify(error));
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

export const sendEmail = async (to: string, subject: string, html: string) => {
    await resend.emails.send({
        from: FROM_EMAIL,
        to: to,
        subject: subject,
        html: html
    });
}

export const checkIsraeliPhoneNumber = (phoneNumber: string): String => {
    let countryCodeFound = false;
    let phone_number = phoneNumber.trim();

    // Check if number already starts with +972 or 972
    for (const countryCode of countryCodes) {
        // Check with or without the plus sign
        if (
            phone_number.startsWith(countryCode) ||
            phone_number.startsWith(countryCode.replace('+', ''))
        ) {
            countryCodeFound = true;
            break;
        }
    }

    if (!countryCodeFound) {
        // 1) Strip a leading '0' if present
        phone_number = phone_number.replace(/^0/, "");

        // 2) If it doesn't start with '+', prepend '972'
        if (!phone_number.startsWith("+")) {
            phone_number = "972" + phone_number;
        }
    }

    return phone_number;
};

export function formatPhoneNumberToChatId(input: string): string {
    if (input.includes('@')) {
        return input;
    }
    
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, '');

    // Determine the suffix based on the length of the cleaned number
    const suffix = cleaned.length > 14 ? '@g.us' : '@c.us';

    // Return the formatted string
    return `${cleaned}${suffix}`;
}