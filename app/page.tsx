"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import InputComponent from "@/components/input";
import { Button } from "@nextui-org/button";

interface Message {
  role: "user" | "ai";
  content: string;
}

// Update the InputComponent props type
interface InputComponentProps {
  onSubmit: (content: string) => void;
  messages: Message[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { data: session, status } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [status]);

  const handleNewMessage = async (newMessageContent: string) => {
    setIsLoading(true);

    const newMessage: Message = { role: "user", content: newMessageContent };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Send the entire conversation history to the API
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: [...messages, newMessage] }),
    });

    // Process the response and add the AI's reply
    if (response.ok) {
      const data = await response.json();
      const aiMessage: Message = { role: "ai", content: data.generatedText };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setIsLoading(false);
    } else {
      setIsLoading(false);

      console.error("Failed to get AI response");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8 text-center">
        Christian AI Chat
      </h1>
      {status === "authenticated" && session.user?.name && (
        <p className="text-lg mb-4">Welcome, {session.user.name}!</p>
      )}
      {showWarning && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
          role="alert"
        >
          <p className="font-bold">Warning</p>
          <p>
            You are not logged in. Your chats will be lost after refreshing the
            page.
          </p>
        </div>
      )}
      {/* <InputComponent
        onSubmit={(content: string) => handleNewMessage(content)}
      /> */}
      <InputComponent
        onSubmit={(content: string) => handleNewMessage(content)}
        messages={messages}
        isLoading={isLoading}
      />

      {/* <InputComponent onSubmit={handleNewMessage} messages={messages} /> */}
    </main>
  );
}
