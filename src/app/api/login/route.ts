/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json();

  try {
    await dbConnect();

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return NextResponse.json(
        { 
            message: "No user found with this identifier" 
        }, 
        { 
            status: 404 
        }
    );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { 
            message: "Please verify your account before logging in" 
        }, 
        { 
            status: 403 
        }
    );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
            message: "Incorrect password" 
        },
        { 
            status: 401 
        }
        );
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json(
        userWithoutPassword, 
        {
            status: 200 
        }
        );
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
        { 
            message: "Internal server error" 
        }, 
        { 
            status: 500 
        }
    );
  }
}