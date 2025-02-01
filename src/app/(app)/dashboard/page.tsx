'use client'

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Message, User } from "@/models/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";


function Page() {

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false); //state change for the button of the switch 
  const router = useRouter();

  const {toast} = useToast();

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  }

  const {data:session} = useSession();
  
  const form=useForm({
    resolver:zodResolver(acceptMessageSchema)
  })

  // useForm documentation read
  const {register, watch, setValue} = form;

  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessageStatus=useCallback(async()=>{
    setIsSwitchLoading(true);

    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message || "Failed to fetch accept messages status",
        variant:"destructive"
      });
    }
    finally{
      setIsSwitchLoading(false);
    }
  },[setValue, toast])
 

  const fetchAllMessages = useCallback(async (refresh:boolean) => {
    setIsLoading(true);
    setIsSwitchLoading(true);

    try {
      const response = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(response.data.messages || []);
      if(refresh){
        toast({
          title: 'Success',
          description: 'Messages refreshed successfully',
          variant:"default"
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message || "Failed to fetch all messages",
        variant:"destructive"
      });
    }
    finally{
      setIsLoading(false);
      setIsSwitchLoading(false);
    }
  },[setIsLoading,setMessages,toast])

  useEffect(()=>{
    if(!session || !session.user) return;
    fetchAcceptMessageStatus();
    fetchAllMessages(false);
  },[session,setValue,fetchAcceptMessageStatus,fetchAllMessages])
 
  // handle switch change
  const handleSwitchChange = async () => {
    setIsSwitchLoading(true);

    try {
      await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: 'Success',
        description: 'Message acceptance status updated successfully',
        variant:"default"
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message || "Failed to update message acceptance status",
        variant:"destructive"
      });
    }
    finally{
      setIsSwitchLoading(false);
    }
  }

  const username = session?.user ? (session.user as User).username : '';
  
  //TODO: built base url, check for more methods doing this
  let baseUrl = '';
  if (typeof window !== "undefined") {
    baseUrl = `${window.location.protocol}//${window.location.host}`;
  }
  const profileUrl = `${baseUrl}/u/${username}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'Success',
      description: 'Profile URL copied to clipboard',
      variant:"default"
    });
    router.replace(profileUrl)
    
  }

  if(!session || !session.user){
    return <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <p>You need to be logged in to view this page.</p>
    </div>
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchAllMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id as string}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default Page