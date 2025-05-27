import mongoose, { Document, models, model } from "mongoose";

export interface IMessage {
  chat_wa_id: string;
  direction: "inbound" | "outbound";
  content: string;
  timestamp: Date;
}

export type MessageDocument = IMessage & Document;

const messageSchema = new mongoose.Schema<MessageDocument>({
  chat_wa_id: { type: String, required: true },
  direction: { type: String, enum: ["inbound", "outbound"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

const MessageModel =
  models.Message || model<MessageDocument>("Message", messageSchema);
export default MessageModel;
