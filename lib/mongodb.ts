import { MongoClient, Db } from "mongodb";
import { collectSegmentData } from "next/dist/server/app-render/collect-segment-data";

const uri = process.env.MONGODB_URI; // Your MongoDB connection string

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let clientPromiseDb: Promise<Db>;

const DATABASE_NAME = process.env.DATABASE_NAME || "whatsappSystem";

if (!uri) {
  throw new Error("MONGODB_URI is not defined");
}

if (process.env.NODE_ENV === "development") {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri);

  clientPromise = client.connect().then(() => {
    console.log("Connected to MongoDB");
    return client;
  }).catch(err => {
    console.error("Failed to connect to MongoDB", err);
    throw err; // Re-throw the error to handle connection failure
  });
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri);
  clientPromise = client.connect();
}



clientPromiseDb = client.connect().then(() => {
  const db = client.db(DATABASE_NAME); // Specify the database
  return db; // Return the database object
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
  throw err; // Re-throw the error to handle connection failure
});

export { clientPromise, clientPromiseDb };