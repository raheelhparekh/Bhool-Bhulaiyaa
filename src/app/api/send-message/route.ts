import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/models/User";
import { NextRequest } from "next/server";

// sending message algorithm --> POST
/*
  connect to database
  get username and content from the request body
  find the user with the username
  if the user does not exist, return error with user not found
  then check if user is accepting messages or not
  if user not accepting messages, return error with user not accepting messages
  else create a new message object with the content and current date
  push the new message to the user's messages array
  save the user
  return success message
*/
export async function POST(request: NextRequest) {
  await dbConnect();
  const { username, content } = await request.json();

  try {
    const user = await UserModel.findOne({ username }).exec();

    if (!user) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    // Check if the user is accepting messages
    if (!user.isAcceptingMessages) {
      return Response.json(
        { message: "User is not accepting messages", success: false },
        { status: 403 } 
      );
    }

    const newMessage = { content, createdAt: new Date() };

    // Push the new message to the user's messages array
    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      { message: "Message sent successfully", success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding message:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
