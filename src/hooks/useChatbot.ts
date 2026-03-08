"use client";

import { useState } from "react";
import { chatbotTree } from "@/src/data/chatbotTree";

interface Message {
  sender: "bot" | "user";
  text: string;
}

export function useChatbot() {
  const [currentNode, setCurrentNode] = useState("start");

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: chatbotTree.start.message,
    },
  ]);

  const node = chatbotTree[currentNode] || chatbotTree.start;

  const selectOption = (label: string, next: string) => {
    const nextNode = chatbotTree[next];

    if (!nextNode) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: label,
      },
      {
        sender: "bot",
        text: nextNode.message,
      },
    ]);

    setCurrentNode(next);
  };

  const resetChat = () => {
    setCurrentNode("start");
    setMessages([
      {
        sender: "bot",
        text: chatbotTree.start.message,
      },
    ]);
  };

  return {
    node,
    messages,
    selectOption,
    resetChat,
  };
}
