import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/prisma/client";
import { Session } from "next-auth";
interface CustomSession extends Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession;

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find or create the user
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      },
    });

    // Create a new chat for the user
    const newChat = await prisma.chat.create({
      data: {
        title: "Gods",
        user: {
          connect: { id: user.id },
        },
      },
    });

    return NextResponse.json({ chatId: newChat.id });
  } catch (error) {
    console.error("Error creating new chat:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
