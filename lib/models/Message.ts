import mongoose, { Document, models, model } from "mongoose";
interface IMessage {
  wa_id: string;
  from: string;
  to: string;
  direction: "inbound" | "outbound";
  timestamp: Date;
  status: "sent" | "delivered" | "read" | "failed";
}

interface TextMessage extends IMessage {
  type: "text";
  text: string;
}
interface ImageMessage extends IMessage {
  type: "image";
  image: {
    caption: string;
    sha256: string;
    id: string;
    mime_type: string;
  };
}

export type MessageDocument = (TextMessage | ImageMessage) & Document;

const messageSchema = new mongoose.Schema<MessageDocument>({
  wa_id: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  direction: { type: String, enum: ["inbound", "outbound"], required: true },
  text: String,
  timestamp: { type: Date, required: true },
  status: {
    type: String,
    enum: ["sent", "delivered", "read", "failed"],
    required: true,
    default: "sent",
  },
  type: { type: String, enum: ["image", "text"] },
  image: {
    caption: String,
    sha256: String,
    id: String,
    mime_type: String,
  },
});

const MessageModel =
  models.Message || model<MessageDocument>("Message", messageSchema);
export default MessageModel;
