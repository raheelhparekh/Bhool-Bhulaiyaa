import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function GET() {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const result = await model.generateContent(prompt);

    const generatedText= result.response.text();
    // console.log(result.response.text());
    return NextResponse.json({ text: generatedText });
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    throw error;
  }
}

// this is a chatbot example
// export async function POST(req: NextRequest) {
//     try {
//         const { message } = await req.json();
//         const chat = model.startChat({
//             history: [
//               {
//                 role: "user",
//                 parts: [{ text: "Hello" }],
//               },
//               {
//                 role: "model",
//                 parts: [{ text: "Great to meet you. What would you like to know?" }],
//               },
//             ],
//           });
          
//           const result = await chat.sendMessage(message);
//           console.log(result.response.text());
//           const result2 = await chat.sendMessage("How many paws are in my house?");
//           console.log(result2.response.text());

//           return NextResponse.json({
//             text: result.response.text(),
//             text2: result2.response.text()
//           });
//     } catch (error) {
//         console.error("An unexpected error occurred:", error);
//         throw error;
        
//     }
// }