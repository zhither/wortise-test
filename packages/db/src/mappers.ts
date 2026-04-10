import type { Chat, Message } from "@wortise/shared";
import { ObjectId } from "mongodb";

import type { ChatDoc, MessageDoc } from "./types.js";

export function chatDocToDto(doc: ChatDoc): Chat {
  return {
    _id: doc._id.toHexString(),
    userId: doc.userId.toHexString(),
    title: doc.title,
    pinned: doc.pinned,
    pinnedAt: doc.pinnedAt ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    lastMessageAt: doc.lastMessageAt ?? undefined,
  };
}

export function messageDocToDto(doc: MessageDoc): Message {
  return {
    _id: doc._id.toHexString(),
    chatId: doc.chatId.toHexString(),
    userId: doc.userId.toHexString(),
    role: doc.role,
    parts: doc.parts,
    status: doc.status,
    model: doc.model,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}
