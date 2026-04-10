/**
 * Ejecutar: pnpm db:indexes (requiere MONGODB_URI en el entorno o en apps/api/.env)
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { MongoClient } from "mongodb";

import { COLLECTIONS } from "../collections.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../../..");
const apiEnv = join(repoRoot, "apps/api/.env");
if (existsSync(apiEnv)) {
  config({ path: apiEnv });
} else {
  const rootEnv = join(repoRoot, ".env");
  if (existsSync(rootEnv)) {
    config({ path: rootEnv });
  }
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error(
    "Missing MONGODB_URI. Creá apps/api/.env desde apps/api/.env.example (o exportá la variable) y definí MONGODB_URI.",
  );
  process.exit(1);
}

const client = new MongoClient(uri);

async function main(): Promise<void> {
  await client.connect();
  const db = client.db();

  await db.collection(COLLECTIONS.chats).createIndexes([
    {
      key: { userId: 1, pinned: -1, lastMessageAt: -1, updatedAt: -1 },
      name: "chats_user_list",
    },
    { key: { userId: 1, title: 1 }, name: "chats_user_title" },
  ]);

  await db.collection(COLLECTIONS.messages).createIndexes([
    {
      key: { chatId: 1, userId: 1, createdAt: -1, _id: -1 },
      name: "messages_chat_timeline",
    },
  ]);

  console.log("Indexes ensured.");
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
