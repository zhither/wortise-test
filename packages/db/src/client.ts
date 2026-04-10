import { MongoClient } from "mongodb";

let client: MongoClient | undefined;

export function getMongoClient(uri: string): MongoClient {
  if (!client) {
    client = new MongoClient(uri);
  }
  return client;
}

export async function connectMongo(uri: string): Promise<MongoClient> {
  const c = getMongoClient(uri);
  await c.connect();
  return c;
}
