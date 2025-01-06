// custom signup route for user registration

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

// SIGN-UP algorithm
/*
 IF exists email THEN 
    IF email is verified THEN
        success:FALSE
    
    ELSE email is not verified THEN
        send verification email
        save user
        return success:TRUE   
 ELSE
    hash password
    save user
    send verification email
    return success:TRUE
*/

export async function POST(request: NextRequest) {
  // STEP1 : Connect to the database
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    console.log({ username, email, password });

    // step2:  checking USER EXIST BY USERNAME
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }

    // step3: checking USER EXIST BY EMAIL
    const existingUserVerifiedByEmail = await UserModel.findOne({
      email,
      isVerified: true,
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // generating 6 digit random number

    // step4: if user exist by email then check if user is verified by email or not
    if (existingUserVerifiedByEmail) {
      if (existingUserVerifiedByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          {
            status: 400,
          }
        );
      } else {
        // this means user exist toh karta he but verified nahi he
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserVerifiedByEmail.password = hashedPassword;
        existingUserVerifiedByEmail.verifyCode = verifyCode;
        existingUserVerifiedByEmail.verifyCodeExpiry = new Date(
          Date.now() + 3600000
        );

        await existingUserVerifiedByEmail.save();
      }
    }
    // ELSE : user doesnt exist by email. means a new user is coming to register
    else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const user = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });
      await user.save();
    }

    // step 5: send verification email to verify the user
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    } else {
      return Response.json(
        {
          success: true,
          message: "User registered successfully. Please verify your email.",
        },
        {
          status: 201,
        }
      );
    }
  } catch (error) {
    console.log("Error in registering user SignUp ", error);
    return Response.json(
      {
        success: false,
        message: "Error in registering user SignUp",
      },
      {
        status: 500,
      }
    );
  }
}
