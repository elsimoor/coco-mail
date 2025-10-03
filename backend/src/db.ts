import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables.");
}

let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  db = client.db();
  console.log("Connected to MongoDB");
  return db;
}