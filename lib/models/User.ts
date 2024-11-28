import  mongoose, { Schema, model } from "mongoose";
import { ObjectId } from 'mongodb';
export interface UserDocument {
    _id: ObjectId;
    unique_id: string;
    email: string;
    password: string;
    email_verified: boolean;
    email_verification_token: string;
    name: string;
    phone: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
    apiKey: string;
    kbAppBaseUrl?: string
  }


  const UserSchema = new Schema<UserDocument>({
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new ObjectId().toString(),
      required: true
    },
    unique_id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email_verified: {
      type: Boolean,
      default: undefined, // This will allow any assigned value to persist
    },
    email_verification_token: {
      type: String,
      default: undefined, // Avoids overriding assigned value with null
    },
    apiKey: {
      type: String,
      default: undefined, // Avoids overriding assigned value with null
    },
    kbAppBaseUrl: {
      type: String,
      default: undefined, // Avoids overriding assigned value with null
    },
  },
  {
    timestamps: true,
  }
);

export interface UserInterface {
  id: string; // or whatever properties your User model has
  email: string;
  password: string;
  email_verified: boolean;
  email_verification_token: string;
  apiKey: string;
  kbAppBaseUrl?: string
}

// mongoose.models.User = model<UserDocument>('User', UserSchema);

const User = mongoose.models.User || model<UserDocument>('User', UserSchema);

export  default  User;