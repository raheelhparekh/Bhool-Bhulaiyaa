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
        { 
          success: false,
          message: "User not found",  
        },
        { 
          status: 404 
        }
      );
    }

    // Check if the user is accepting messages
    if (!user.isAcceptingMessages) {
      return Response.json(
        { 
          success: false ,
          message: "User is not accepting messages", 
        },
        { 
          status: 403 
        } 
      );
    }

    const newMessage = { content, createdAt: new Date() };

    // Push the new message to the user's messages array
    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      { 
        success: true ,
        message: "Message sent successfully", 
        
      },
      { 
        status: 201 
      }
    );
  } catch (error) {
    console.error("Error adding message:", error);
    return Response.json(
      { 
        success: false ,
        message: "Internal server error", 
      },
      { 
        status: 500 
      }
    );
  }
}
