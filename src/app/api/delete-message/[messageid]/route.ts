import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// params is an object returns a Promise, so we need to await it
export async function DELETE(request: NextRequest, context: { params: Promise<{ messageid: string }> }) {
  const params = await context.params;
  const messageid = params.messageid;

  await dbConnect();

  const session = await auth();
  const user = session?.user;

  if (!session || !user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { 
        status: 401 
      }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Message not found or already deleted",
        },
        { 
          status: 404 
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message deleted",
      },
      { 
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error deleting message:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error deleting message",
      },
      { 
        status: 500 
      }
    );
  }
}