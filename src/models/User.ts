import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;

  messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    match: [/.+\@.+\..+/, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  verifyCode: {
    type: String,
    required: [true, "Please provide a verification code"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Please provide a verification code expiry date"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
});

// next js edge case me run hota he toh we dnt know we r running for first time or not or it is being run before also ie all schemas are built before or not. therefore we need to check if the model is already built or not

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);

export default UserModel;