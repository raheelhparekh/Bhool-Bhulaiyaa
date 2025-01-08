"use client";

import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";

export default function SignUpForm() {
  // we want to check for our username but not with every keyboard tap, so we will need to do it using a debouncing technique
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState(""); // backend me username he ya nahi kuch message show karega
  const [isCheckingUsername, setIsCheckingUsername] = useState(false); // loader state, when we send request to backend to check username availability we will show a loader
  const [isSubmitting, setIsSubmitting] = useState(false); // form submit hone pe loader show karega

  const debounced = useDebounceCallback(setUsername, 500); // usehooks-ts document me dekho, 300ms ke baad username ko update karega

  const router = useRouter();
  const { toast } = useToast();

  // shadcn form documenation dekho, zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // debouncing ke sath sath backend se we need to check username availability, therefore useEffect hook
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true); // loader show karega bcoz checking chal raha he
        setUsernameMessage(""); // Reset message
        try {
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?username=${username}`
          );
          setUsernameMessage(response.data.message); // axios requires response.data.message. message will come from backend from response in check-username-unique api
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          );
        } finally {
          setIsCheckingUsername(false); // loader hide karega bcoz checking done. finally block always runs. otherwise we have to write setIsCheckingUsername in both try and catch block
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true); // loader show karega bcoz submitting form
    try {
      //TODO: Remove this console.log
      console.log(data);

      await axios.post<ApiResponse>("/api/sign-up", data);
      toast({
        title: "Account created",
        description: "Your account has been created successfully",
      });

      // router se will redirect to verify page to check username unique and OTP code verify
      router.replace(`/verify/${username}`);
      setIsSubmitting(false); // loader hide karega bcoz submitting done
    } catch (error) {
      console.error("Error in sign-up", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const message = axiosError.response?.data.message;
      toast({
        title: "Sign-up failed",
        description: message ?? "Error creating account",
        variant: "destructive",
      });
      setIsSubmitting(false); // loader hide karega bcoz submitting done
    }
  };

  // UI goes here
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>

        {/* shadcn form documentation dekho, this ...form bcoz upar we have used useForm() */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === "Username is unique"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <Input {...field} name="email" />
                  <p className="text-muted text-gray-400 text-sm">
                    We will send you a verification code
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
