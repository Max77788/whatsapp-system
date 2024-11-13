import { clientPromiseDb } from '@/lib/mongodb';


export const update_user = async (filter: any, stuff_to_update: any) => {
    try {
        const db = await clientPromiseDb;
        const userFound = await db.collection("users").findOne(filter);

    if (userFound) {
        // Update or insert message logic for the user
        await db.collection("users").updateOne(
            filter,
            { $set: stuff_to_update },
            { upsert: true }
        );
        return true;
        }
        return false;
    } catch (error) {
        console.error(`Error updating user: ${error}`);
        throw error;
    }
}

export const find_user = async (filter: any) => {
    const db = await clientPromiseDb;
    const userFound = await db.collection("users").findOne(filter);

    if (userFound) {
        return userFound;
    } else {
        throw new Error("User not found");
    }
}