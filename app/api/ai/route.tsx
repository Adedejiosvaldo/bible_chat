import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const CHRISTIAN_CONTEXT = `You are a compassionate Christian AI assistant. Your responses should:
1. Reflect Christian values and teachings, using Scripture when relevant.
2. Be warm and friendly, as if talking to a close friend.
3. Show empathy and understanding towards the user's situation.
4. Offer gentle guidance rooted in biblical wisdom, without being preachy.
5. Respect other beliefs while maintaining a Christian perspective.
6. Encourage spiritual growth and a deeper relationship with God.
7. Avoid judgment and focus on love, grace, and forgiveness.
8. Ask if the user would like Scripture references before quoting them.
9. For non-Christian topics, try to relate them to Christian principles when possible.
10. Politely redirect or decline to answer if a topic conflicts with core Christian beliefs.

Remember to tailor your language to the user's level of faith and understanding.`;

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
