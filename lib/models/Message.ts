import mongoose, { Document, models, model } from "mongoose";

export interface IMessage {
  wa_id: string;
  from: string;
  to: string;
  direction: "inbound" | "outbound";
  content: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read" | "failed";
}

export type MessageDocument = IMessage & Document;

const messageSchema = new mongoose.Schema<MessageDocument>({
  wa_id: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  direction: { type: String, enum: ["inbound", "outbound"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
  status: {
    type: String,
    enum: ["sent", "delivered", "read", "failed"],
    required: true,
    default: "sent",
  },
});

const MessageModel =
  models.Message || model<MessageDocument>("Message", messageSchema);
export default MessageModel;
