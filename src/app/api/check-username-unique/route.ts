import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextRequest } from "next/server";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

// get method if someone send username i want to check and give them whether username is valid or not

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    // username check karega url se, so query paramter se username milega
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    // validate with zod

    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log(result); //TODO: remove this line but console log and check what is the result

    if (!result.success) {
      const usernameError = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message: usernameError?.length > 0 || "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingUserVerified = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerified) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error occured while checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error occured while checking username",
      },
      { status: 500 }
    );
  }
}
