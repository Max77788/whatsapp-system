import { clientPromise, clientPromiseDb } from '@/lib/mongodb';
import { MongoClient, Db } from 'mongodb';

const DATABASE_NAME = process.env.DATABASE_NAME || "whatsappSystem";

const uri = process.env.MONGODB_URI || "";


export const update_user = async (filter: any, stuff_to_update: any, action: string = "$set") => {
    let client;
    try { 
        client = new MongoClient(uri)
        let db: Db;

        // Connect to MongoDB
        await client.connect();
        
        db = client.db(DATABASE_NAME);
        
        const userFound = await db.collection("users").findOne(filter);

        if (userFound) {
            // Update or insert message logic for the user
            if (action === "$set" || action === "$push" || action === "$addToSet") {
                await db.collection("users").updateOne(
                    filter,
                    { [action]: stuff_to_update },
                    { upsert: true }
                );
            } else {
                await db.collection("users").updateOne(
                    filter,
                    { [action]: stuff_to_update }
                );
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error updating user: ${error}`);
        throw error;
    } finally {
        if (client) {
            await client.close(); // Ensure the client connection is closed after the operation
            console.log("Connection to MongoDB closed");
        }
    }
}


export const find_user = async (filter: any) => {
    let client;
    try {
        // Create a new MongoClient instance
        client = new MongoClient(uri);

        // Connect to MongoDB
        await client.connect();

        // Get the database instance
        const db: Db = client.db(DATABASE_NAME);

        // Find the user
        const userFound = await db.collection("users").findOne(filter);

        if (userFound) {
            return userFound;
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        console.error(`Error finding user: ${error}`);
        throw error;
    } finally {
        if (client) {
            await client.close(); // Ensure the client connection is closed after the operation
            //console.log("Connection to MongoDB closed");
        }
    }
};
