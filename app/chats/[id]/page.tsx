"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import InputComponent from "@/components/input";
import { Button } from "@nextui-org/button";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ChatPage() {
  const { id: chatId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const [initialMessagesSet, setInitialMessagesSet] = useState(false);

  useEffect(() => {
    const initialMessages = searchParams.get("messages");
    if (initialMessages) {
      setMessages(JSON.parse(decodeURIComponent(initialMessages)));
      router.replace(`/chats/${chatId}`);
    } else if (chatId) {
      fetchMessages();
    }
  }, [chatId, searchParams]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleNewMessage = async (newMessageContent: string) => {
    setIsLoading(true);
    const newMessage: Message = { role: "user", content: newMessageContent };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, newMessage], chatId }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.generatedText },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8 text-center">
        Christian AI Chat
      </h1>
      {status === "authenticated" && session?.user?.name && (
        <p className="text-lg mb-4">Welcome, {session.user.name}!</p>
      )}

      <InputComponent
        onSubmit={handleNewMessage}
        messages={messages}
        isLoading={isLoading}
      />
    </main>
  );
}
