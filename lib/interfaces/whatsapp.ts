export interface Message {
  from: string;
  id: string;
  timestamp: string;
  text?: { body: string };
  type:
    | "audio"
    | "button"
    | "document"
    | "text"
    | "image"
    | "interactive"
    | "order"
    | "sticker"
    | "system"
    | "unknown"
    | "video";
}
export interface Contact {
  profile: { name: string };
  user_id: string;
  wa_id: string;
}
export interface Status {
  recipient_id: string;
  status: "delivered" | "read" | "sent";
  id: string;
}
export interface WAWebhookPayload {
  object: "whatsapp_business_account";
  entry: {
    id: string;
    changes: {
      field: string;
      value: {
        messaging_product: "whatsapp";
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Contact[];
        errors?: {
          code: number;
          title: string;
          message: string;
          error_data: {
            details: string;
          };
        }[];
        messages?: Message[];
        statuses?: Status[];
      };
    }[];
  }[];
}
