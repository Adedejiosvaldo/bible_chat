import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/prisma/db";
import { Session } from "next-auth";

interface CustomSession extends Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const CHRISTIAN_CONTEXT = `You are a compassionate Christian AI assistant named Bibion. Your responses should:
1. Reflect Christian values and teachings, using Scripture when relevant.
2. Be warm and friendly, as if talking to a close friend.
3. Show empathy and understanding towards the user's situation.
4. Offer gentle guidance rooted in biblical wisdom, without being preachy.
5. Encourage spiritual growth and a deeper relationship with God.
6. Avoid judgment and focus on love, grace, and forgiveness.
7. Ask if the user would like Scripture references before quoting them.
8. Tailor your language to the user's level of faith and understanding.

Important guidelines:
- Discuss only topics directly related to Christianity, the Bible, and Christian living.
- If asked about non-Christian topics, politely explain that you're designed to discuss Christian matters only and redirect the conversation to relevant Christian principles if possible.
- If a question or topic conflicts with core Christian beliefs, respectfully decline to answer and suggest focusing on biblical teachings instead.
- Do not engage in discussions about other religions or secular topics unless it's to contrast them with Christian beliefs.

Your primary goal is to provide biblically sound guidance and support within the context of Christianity.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, chatId } = await request.json();
    const session = (await getServerSession(authOptions)) as CustomSession;

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const aiChat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: CHRISTIAN_CONTEXT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I will act as a Christian AI assistant, providing responses rooted in biblical teachings and Christian values.",
            },
          ],
        },
        ...messages.slice(0, -1).map((msg: { role: string; content: any }) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    console.log("AI Input:", JSON.stringify(messages, null, 2));

    const result = await aiChat.sendMessage(
      messages[messages.length - 1].content
    );
    const response = result.response;
    const text = response.text();

    console.log("AI Response:", text);

    let newChatId = chatId;
    let title = "";

    // Only create a new chat and save messages if the user is authenticated
    if (session?.user) {
      if (!chatId) {
        const titleResult = await model.generateContent(
          `Generate a short, catchy title (max 6 words) for a Christian conversation that starts with this message: "${
            messages[messages.length - 1].content
          }"`
        );
        title = titleResult.response.text().replace(/^"(.*)"$/, "$1");

        const newChat = await prisma.chat.create({
          data: {
            user: {
              connect: { email: session.user.email! },
            },
            title: title,
          },
        });
        newChatId = newChat.id;
      }

      await saveMessages(
        session.user.email!,
        messages[messages.length - 1].content,
        text,
        newChatId
      );
    }

    // Prepare and return the response
    return NextResponse.json({
      generatedText: text,
      chatId: newChatId,
      title: title,
    });
  } catch (error: any) {
    console.error("API route error:", error);
    console.error(error.stack);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error.message },
      { status: 500 }
    );
  }
}

async function saveMessages(
  userEmail: string,
  userContent: string,
  aiContent: string,
  chatId: string
) {
  await prisma.message.createMany({
    data: [
      {
        content: userContent,
        role: "USER",
        chatId: chatId,
      },
      {
        content: aiContent,
        role: "AI",
        chatId: chatId,
      },
    ],
  });
}
