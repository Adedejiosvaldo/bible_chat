import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { Avatar } from "@nextui-org/avatar";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

import { aiAvatar, userAvatar } from "@/public/images";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface InputComponentProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
  messages: Message[];
}

const InputComponent = ({
  onSubmit,
  messages,
  isLoading,
}: InputComponentProps) => {
  const { data: session } = useSession();

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const breakLongWords = (content: string) => {
    const words = content.split(" ");
    return words
      .map((word) =>
        word.length > 30 ? word.match(/.{1,30}/g)?.join(" ") : word
      )
      .join(" ");
  };
  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    onSubmit(inputValue);
    setInputValue("");

    // Remove the API call from here, as it should be handled in the parent component
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col px-4 sm:px-0">
      <div className="space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              } items-start max-w-[90%] sm:max-w-[80%]`}
            >
              <Avatar
                src={
                  message.role === "user"
                    ? session?.user?.image || userAvatar.src
                    : aiAvatar.src
                }
                size="sm"
                className={`${
                  message.role === "user" ? "ml-2" : "mr-2"
                } flex-shrink-0`}
              />
              <div
                className={`p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-content1 text-content1-foreground"
                } break-words`}
              >
                <ReactMarkdown>{breakLongWords(message.content)}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-divider pt-4 w-full">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-end gap-2 w-full"
        >
          <Textarea
            isRequired
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(
                e as unknown as React.KeyboardEvent<HTMLTextAreaElement>
              )
            }
            placeholder="Type your message..."
            className="w-full min-h-[40px]"
            minRows={1}
            maxRows={4}
          />
          <Button
            type="submit"
            isLoading={isLoading}
            color="primary"
            className="w-full sm:w-auto h-[40px] mt-2 sm:mt-0"
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default InputComponent;
