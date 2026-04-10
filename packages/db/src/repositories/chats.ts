import type { Db } from "mongodb";
import { ObjectId } from "mongodb";

import { COLLECTIONS } from "../collections.js";
import { chatDocToDto, toObjectId } from "../mappers.js";
import type { ChatDoc } from "../types.js";

export type ChatListRow = {
  _id: ObjectId;
  title: string;
  pinned: boolean;
  pinnedAt: Date | null;
  lastMessageAt: Date | null;
  updatedAt: Date;
};

export async function findChatForUser(
  db: Db,
  chatId: string,
  userId: string,
): Promise<ChatDoc | null> {
  const col = db.collection<ChatDoc>(COLLECTIONS.chats);
  return col.findOne({
    _id: toObjectId(chatId),
    userId: toObjectId(userId),
  });
}

/**
 * Paginación por offset codificado en cursor (base64 JSON).
 * Trade-off documentado: suficiente para listas moderadas; migrar a keyset si escala.
 */
export async function listChatsPage(input: {
  db: Db;
  userId: string;
  limit: number;
  cursor?: string;
  titleQuery?: string;
}): Promise<{ items: ChatListRow[]; nextCursor: string | null }> {
  const col = input.db.collection<ChatDoc>(COLLECTIONS.chats);
  const userOid = toObjectId(input.userId);
  const offset = decodeOffsetCursor(input.cursor);

  const filter: Record<string, unknown> = { userId: userOid };
  if (input.titleQuery?.trim()) {
    filter.title = {
      $regex: escapeRegex(input.titleQuery.trim()),
      $options: "i",
    };
  }

  const findCursor = col
    .find(filter)
    .sort({ pinned: -1, lastMessageAt: -1, updatedAt: -1, _id: -1 })
    .skip(offset)
    .limit(input.limit + 1);

  const docs = await findCursor.toArray();
  const hasMore = docs.length > input.limit;
  const slice = hasMore ? docs.slice(0, input.limit) : docs;
  const nextOffset = offset + slice.length;
  const nextCursor = hasMore ? encodeOffsetCursor(nextOffset) : null;

  return {
    items: slice.map((d: ChatDoc) => ({
      _id: d._id,
      title: d.title,
      pinned: d.pinned,
      pinnedAt: d.pinnedAt ?? null,
      lastMessageAt: d.lastMessageAt ?? null,
      updatedAt: d.updatedAt,
    })),
    nextCursor,
  };
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

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createChat(input: {
  db: Db;
  userId: string;
  title: string;
}): Promise<ChatDoc> {
  const col = input.db.collection<ChatDoc>(COLLECTIONS.chats);
  const now = new Date();
  const doc: Omit<ChatDoc, "_id"> = {
    userId: toObjectId(input.userId),
    title: input.title,
    pinned: false,
    pinnedAt: null,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: null,
  };
  const res = await col.insertOne(doc as ChatDoc);
  const inserted = await col.findOne({ _id: res.insertedId });
  if (!inserted) throw new Error("Failed to load chat after insert");
  return inserted;
}

export async function renameChat(input: {
  db: Db;
  chatId: string;
  userId: string;
  title: string;
}): Promise<ChatDoc | null> {
  const col = input.db.collection<ChatDoc>(COLLECTIONS.chats);
  const now = new Date();
  const res = await col.findOneAndUpdate(
    { _id: toObjectId(input.chatId), userId: toObjectId(input.userId) },
    { $set: { title: input.title, updatedAt: now } },
    { returnDocument: "after" },
  );
  return res ?? null;
}

export async function setChatPinned(input: {
  db: Db;
  chatId: string;
  userId: string;
  pinned: boolean;
}): Promise<ChatDoc | null> {
  const col = input.db.collection<ChatDoc>(COLLECTIONS.chats);
  const now = new Date();
  const pinnedAt = input.pinned ? now : null;
  const res = await col.findOneAndUpdate(
    { _id: toObjectId(input.chatId), userId: toObjectId(input.userId) },
    { $set: { pinned: input.pinned, pinnedAt, updatedAt: now } },
    { returnDocument: "after" },
  );
  return res ?? null;
}

export async function deleteChatCascade(input: {
  db: Db;
  chatId: string;
  userId: string;
}): Promise<boolean> {
  const chats = input.db.collection(COLLECTIONS.chats);
  const messages = input.db.collection(COLLECTIONS.messages);
  const chatOid = toObjectId(input.chatId);
  const userOid = toObjectId(input.userId);
  const delChat = await chats.deleteOne({ _id: chatOid, userId: userOid });
  if (delChat.deletedCount === 0) return false;
  await messages.deleteMany({ chatId: chatOid, userId: userOid });
  return true;
}

export async function touchChatLastMessage(input: {
  db: Db;
  chatId: string;
  userId: string;
  at: Date;
}): Promise<void> {
  const col = input.db.collection<ChatDoc>(COLLECTIONS.chats);
  await col.updateOne(
    { _id: toObjectId(input.chatId), userId: toObjectId(input.userId) },
    { $set: { lastMessageAt: input.at, updatedAt: input.at } },
  );
}

export { chatDocToDto };
