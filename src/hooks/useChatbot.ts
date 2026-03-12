"use client";

import { useState, useEffect } from "react";
import { chatbotTree } from "@/src/data/chatbotTree";
import { supabase } from "@/src/lib/supabase";
import { v4 as uuidv4 } from "uuid";

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

  const getSessionId = () => {
    let sessionId = localStorage.getItem("chatbot_session");

    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem("chatbot_session", sessionId);
    }

    return sessionId;
  };

  const saveToSupabase = async (label: string, next: string) => {
    const sessionId = getSessionId();

    await supabase.from("chatbot_sessions").insert([
      {
        session_id: sessionId,
        action: label,
        node: next,
      },
    ]);
  };

  useEffect(() => {
    saveToSupabase("chatbot_opened", "start");
  }, []);

  const selectOption = async (label: string, next: string) => {
    const nextNode = chatbotTree[next];

    if (!nextNode) return;

    await saveToSupabase(label, next);

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

  const resetChat = async () => {
    await saveToSupabase("chat_reset", "start");

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
