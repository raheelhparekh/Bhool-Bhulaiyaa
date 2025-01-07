import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const verifyCodeQuerySchema = z.object({
  code: z.string().length(6, { message: "Verification code must be 6 digits" }),
});

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    // Validate the code using verifyCodeQuerySchema
    try {
      verifyCodeQuerySchema.parse({ code });
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: (validationError as z.ZodError).errors?.[0]?.message || "Invalid code",
        },
        {
          status: 400,
        }
      );
    }

    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // Check if the code is valid and not expired
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return NextResponse.json(
        {
          success: true,
          message: "User verified successfully",
        },
        {
          status: 200,
        }
      );
    } else if (!isCodeNotExpired) {
      return NextResponse.json(
        {
          success: false,
          message: "Code is expired",
        },
        {
          status: 400,
        }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid code",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while verifying the code",
      },
      {
        status: 500,
      }
    );
  }
}
