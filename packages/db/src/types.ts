import type { MessagePart } from "@wortise/shared";
import type { ObjectId } from "mongodb";

export type ChatDoc = {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  pinned: boolean;
  pinnedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date | null;
};

export type MessageDoc = {
  _id: ObjectId;
  chatId: ObjectId;
  userId: ObjectId;
  role: "user" | "assistant" | "system";
  parts: MessagePart[];
  status: "streaming" | "complete" | "failed";
  model?: string;
  createdAt: Date;
  updatedAt: Date;
};
