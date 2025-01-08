import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';

// accept messages algorithm --> POST
/*
  connect to database
  get the user session
  if the user is not found, return error with not authenticated
  get the user id from the user session
  get the accept messages status from the request body
  update the user's message acceptance status
  if the user is not found, return error with user not found
  return success message
*/

// accept messages algorithm --> GET because we are getting the message acceptance status of the user from the database and not updating it like in the POST method above
/*
  connect to database
  get the user session
  if the user is not found, return error with not authenticated
  get the user id from the user session
  find the user by the user id
  if the user does not exist, return error with user not found
  return the user's message acceptance status
*/

export async function POST(request: NextRequest) {
  // Connect to the database
  await dbConnect();

  const session = await auth();
  const user: User = session?.user as User;
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const userId = user._id;
  const { acceptMessages } = await request.json();

  try {
    // Update the user's message acceptance status
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessages: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      // User not found
      return Response.json(
        {
          success: false,
          message: 'Unable to find user to update message acceptance status',
        },
        { status: 404 }
      );
    }

    // Successfully updated message acceptance status
    return Response.json(
      {
        success: true,
        message: 'Message acceptance status updated successfully',
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating message acceptance status:', error);
    return Response.json(
      { success: false, message: 'Error updating message acceptance status' },
      { status: 500 }
    );
  }
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  // Connect to the database
  await dbConnect();

  // Get the user session
  const session = await auth();
  const user = session?.user;

  // Check if the user is authenticated
  if (!session || !user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // Retrieve the user from the database using the ID
    const foundUser = await UserModel.findById(user._id);

    if (!foundUser) {
      // User not found
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return the user's message acceptance status
    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving message acceptance status:', error);
    return Response.json(
      { success: false, message: 'Error retrieving message acceptance status' },
      { status: 500 }
    );
  }
}