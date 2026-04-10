import type { Db } from "mongodb";
import { MongoClient } from "mongodb";

import { env } from "./env.js";

let client: MongoClient | undefined;
let database: Db | undefined;

export async function connectMongo(): Promise<{ client: MongoClient; db: Db }> {
  if (client && database) return { client, db: database };
  const uri = env().MONGODB_URI;
  client = new MongoClient(uri);
  await client.connect();
  database = client.db();
  return { client, db: database };
}

export function getDb(): Db {
  if (!database) throw new Error("Mongo not initialized; call connectMongo first");
  return database;
}
