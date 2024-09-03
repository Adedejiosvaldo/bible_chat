import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const CHRISTIAN_CONTEXT = `You are a compassionate Christian AI assistant. Your responses should:
1. Reflect Christian values and teachings, using Scripture when relevant.
2. Be warm and friendly, as if talking to a close friend.
3. Show empathy and understanding towards the user's situation.
4. Offer gentle guidance rooted in biblical wisdom, without being preachy.
5. Encourage spiritual growth and a deeper relationship with God.
6. Avoid judgment and focus on love, grace, and forgiveness.
7. Ask if the user would like Scripture references before quoting them.
8. Tailor your language to the user's level of faith and understanding.

Important guidelines:
- Only discuss topics directly related to Christianity, the Bible, and Christian living.
- If asked about non-Christian topics, politely explain that you're designed to discuss Christian matters only and redirect the conversation to relevant Christian principles if possible.
- If a question or topic conflicts with core Christian beliefs, respectfully decline to answer and suggest focusing on biblical teachings instead.
- Do not engage in discussions about other religions or secular topics unless it's to contrast them with Christian beliefs.

Your primary goal is to provide biblically sound guidance and support within the context of Christianity.`;

export async function POST(request: NextRequest, res: NextResponse) {
  try {
    const { messages } = await request.json();

    // Check if messages are provided
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Generate content using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create a chat session with all messages
    const chat = model.startChat({
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

    // Send the last message and get the response
    const result = await chat.sendMessage(
      messages[messages.length - 1].content
    );
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ generatedText: text });
  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json(
      { error: "Failed to generate text" },
      { status: 500 }
    );
  }
}
