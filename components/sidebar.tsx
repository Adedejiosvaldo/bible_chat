"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Link, Spinner } from "@nextui-org/react";

interface Chat {
  id: string;
  title: string;
}

export default function Sidebar({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      fetchChats();
    } else if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chats");
      if (!response.ok) throw new Error("Failed to fetch chats");
      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async () => {
    try {
      const response = await fetch("/api/chats/new", { method: "POST" });
      if (!response.ok) throw new Error("Failed to create new chat");
      const data = await response.json();
      router.push(`/chats/${data.chatId}`);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-background rounded-full shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div
        className={`
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out
        fixed left-0 top-0 w-64 h-screen bg-background shadow-lg z-40
        flex flex-col
      `}
      >
        <div className="p-4 border-b border-divider">
          <Button
            onClick={startNewChat}
            color="primary"
            className="w-full"
            disabled={status !== "authenticated"}
          >
            New Chat
          </Button>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner />
            </div>
          ) : status === "authenticated" ? (
            <ul className="space-y-2">
              {chats.map((chat) => (
                <li key={chat.id}>
                  <Link
                    href={`/chats/${chat.id}`}
                    className="block p-2 rounded hover:bg-accent/10 transition-colors"
                  >
                    {chat.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">
              Please sign in to view chats
            </p>
          )}
        </div>
      </div>
    </>
  );
}
