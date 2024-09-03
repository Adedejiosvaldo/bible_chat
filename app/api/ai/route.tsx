import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getConversationState, setConversationState } from "@/config/state";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const CHRISTIAN_CONTEXT = `You are a Christian AI assistant. Always respond in a biblical and Christian manner,
using scripture references when appropriate. Your knowledge and advice should be rooted in Christian teachings
and values. If asked about topics outside of Christian doctrine, kindly redirect the conversation to a
Christian perspective or politely decline to answer if it conflicts with Christian beliefs.`;

export async function POST(request: NextRequest, res: NextResponse) {
  try {
    const { prompt, messages } = await request.json();

    // Check if prompt is provided
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Generate content using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Combine the Christian context with the conversation history and the new prompt
    const fullPrompt = `${CHRISTIAN_CONTEXT}\n\n${messages
      .map(
        (m: { role: string; content: any }) =>
          `${m.role === "user" ? "User" : "AI"}: ${m.content}`
      )
      .join("\n")}\nUser: ${prompt}\nAI:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
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
