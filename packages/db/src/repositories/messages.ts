import type { Db } from "mongodb";

import type { MessagePart } from "@wortise/shared";

import { COLLECTIONS } from "../collections.js";
import { messageDocToDto, toObjectId } from "../mappers.js";
import type { MessageDoc } from "../types.js";

export async function insertMessage(input: {
  db: Db;
  chatId: string;
  userId: string;
  role: MessageDoc["role"];
  parts: MessagePart[];
  status: MessageDoc["status"];
  model?: string;
}): Promise<MessageDoc> {
  const col = input.db.collection<MessageDoc>(COLLECTIONS.messages);
  const now = new Date();
  const doc: Omit<MessageDoc, "_id"> = {
    chatId: toObjectId(input.chatId),
    userId: toObjectId(input.userId),
    role: input.role,
    parts: input.parts,
    status: input.status,
    model: input.model,
    createdAt: now,
    updatedAt: now,
  };
  const res = await col.insertOne(doc as MessageDoc);
  const inserted = await col.findOne({ _id: res.insertedId });
  if (!inserted) throw new Error("Failed to load message after insert");
  return inserted;
}

export async function updateMessageParts(input: {
  db: Db;
  messageId: string;
  userId: string;
  parts: MessagePart[];
  status: MessageDoc["status"];
}): Promise<MessageDoc | null> {
  const col = input.db.collection<MessageDoc>(COLLECTIONS.messages);
  const now = new Date();
  const res = await col.findOneAndUpdate(
    {
      _id: toObjectId(input.messageId),
      userId: toObjectId(input.userId),
    },
    { $set: { parts: input.parts, status: input.status, updatedAt: now } },
    { returnDocument: "after" },
  );
  return res ?? null;
}

export async function listMessagesPage(input: {
  db: Db;
  chatId: string;
  userId: string;
  limit: number;
  cursor?: string;
}): Promise<{ items: MessageDoc[]; nextCursor: string | null }> {
  const col = input.db.collection<MessageDoc>(COLLECTIONS.messages);
  const chatOid = toObjectId(input.chatId);
  const userOid = toObjectId(input.userId);
  const offset = decodeOffsetCursor(input.cursor);

  const filter: Record<string, unknown> = { chatId: chatOid, userId: userOid };

  const docs = await col
    .find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip(offset)
    .limit(input.limit + 1)
    .toArray();

  const hasMore = docs.length > input.limit;
  const slice = hasMore ? docs.slice(0, input.limit) : docs;
  const nextOffset = offset + slice.length;
  const nextCursor = hasMore ? encodeOffsetCursor(nextOffset) : null;

  return { items: slice, nextCursor };
}

function encodeOffsetCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ o: offset }), "utf8").toString("base64url");
}

function decodeOffsetCursor(cursor: string | undefined): number {
  if (!cursor) return 0;
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as { o?: number };
    return typeof parsed.o === "number" && parsed.o >= 0 ? parsed.o : 0;
  } catch {
    return 0;
  }
}

export { messageDocToDto };
