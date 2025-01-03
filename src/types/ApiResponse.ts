// Purpose: Define the structure of the API response. 
// means how the response will be sent consistently from us

import { Message } from "@/models/User";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>
};