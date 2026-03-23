"use client";

import { useState, useEffect, useCallback } from "react";
import graphData from "@/src/data/knowledge-graph.json";
import type {
  ChatNode,
  ChatOption,
  HistoryItem,
  KnowledgeGraph,
} from "@/src/types/chatbot";

const graph = graphData as KnowledgeGraph;

function getNode(id: string): ChatNode | undefined {
  return graph.nodes[id];
}

export function useChatLogic() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState(graph.root);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sessionData, setSessionData] = useState<Record<string, string>>({});
  const [choicePath, setChoicePath] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  const currentNode = getNode(currentNodeId) ?? getNode(graph.root)!;

  // 🔥 INIT SESSION FIRST (BLOCK UI UNTIL READY)
  useEffect(() => {
    const init = async () => {
      const rootNode = getNode(graph.root);
      if (rootNode) {
        setHistory([{ type: "bot", content: rootNode.content }]);
      }

      try {
        const res = await fetch("/api/session", { method: "POST" });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid JSON response from /api/session");
        }
        if (data.session_id) {
          setSessionId(data.session_id);
        }
        setIsReady(true); // ✅ now allow tracking
      } catch (err) {
        console.error("Session error", err);
        setIsReady(true); // fallback so UI still unblocks ideally
      }
    };

    init();
  }, []);

  // 🔥 SIMPLE DIRECT TRACK (NO CONDITIONS)
  const sendEvent = async (event: any) => {
    try {
      await fetch("/api/track-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
    } catch (err) {
      console.error("Track failed", err);
    }
  };

  // NAVIGATION
  const navigateTo = useCallback(
    (nodeId: string) => {
      const nextNode = getNode(nodeId);
      if (!nextNode) return;

      setCurrentNodeId(nodeId);

      setHistory((prev) => [
        ...prev,
        { type: "bot", content: nextNode.content },
      ]);
    },
    []
  );

  // 🔥 OPTION CLICK (ALWAYS STORED)
  const onSelectOption = useCallback(
  async (option: ChatOption) => {
    const newPath = [...choicePath, option.label];

    setChoicePath(newPath);

    setHistory((prev) => [
      ...prev,
      { type: "user", content: option.label },
    ]);

    // ✅ ALWAYS FIRE (no blocking)
    fetch("/api/track-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId || "temp-session", // fallback
        node_id: option.next,
        action_type: "click",
        choice_path: newPath,
        payload: { label: option.label },
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);

    navigateTo(option.next);
  },
  [choicePath, sessionData, navigateTo, sessionId]
);

  // 🔥 INPUT (ALWAYS STORED)
  const onInputSubmit = useCallback(
  async (value: string) => {
    if (currentNode.type !== "input") return;

    const newData = {
      ...sessionData,
      [currentNode.dataKey]: value,
    };

    setSessionData(newData);

    setHistory((prev) => [
      ...prev,
      { type: "user", content: value },
    ]);

    // ✅ ALWAYS FIRE
    fetch("/api/track-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId || "temp-session",
        node_id: currentNode.id,
        action_type: "input",
        choice_path: choicePath,
        payload: {
          field: currentNode.dataKey,
          value,
        },
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);

    navigateTo(currentNode.next);
  },
  [currentNode, sessionData, choicePath, navigateTo, sessionId]
);

  const resetChat = useCallback(() => {
    const rootNode = getNode(graph.root)!;

    setCurrentNodeId(graph.root);
    setHistory([{ type: "bot", content: rootNode.content }]);
    setSessionData({});
    setChoicePath([]);
  }, []);

  return {
    currentNode,
    history,
    sessionData,
    sessionId,
    choicePath,
    onSelectOption,
    onInputSubmit,
    resetChat,
    isReady,
  };
}