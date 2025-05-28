import mongoose, { Document, models, model } from "mongoose";

export interface IChat {
  phone_id: string;
  client_id: string;
  name: string;
  last_updated: Date;
}

export type ChatDocument = IChat & Document;

const chatSchema = new mongoose.Schema<ChatDocument>({
  phone_id: { type: String, required: true },
  client_id: { type: String, required: true },
  name: String,
  last_updated: Date,
});

const ChatModel = models.Chat || model<ChatDocument>("Chat", chatSchema);
export default ChatModel;
