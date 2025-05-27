import mongoose, { Document, models, model } from "mongoose";

export interface IChat {
  wa_id: string;
  name: string;
  last_message: string;
  last_updated: Date;
}

export type ChatDocument = IChat & Document;

const chatSchema = new mongoose.Schema<ChatDocument>({
  wa_id: { type: String, required: true, unique: true },
  name: String,
  last_message: String,
  last_updated: Date,
});

const ChatModel = models.Chat || model<ChatDocument>("Chat", chatSchema);
export default ChatModel;
