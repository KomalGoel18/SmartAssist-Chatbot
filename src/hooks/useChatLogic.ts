"use client";

import { useState, useEffect, useCallback } from "react";
import graphData from "@/src/data/knowledge-graph.json";
import { clientLogger as log } from "@/src/lib/clientLogger";
import type {
  ChatNode,
  ChatOption,
  HistoryItem,
  KnowledgeGraph,
} from "@/src/types/chatbot";

const graph = graphData as KnowledgeGraph;
const CTX = "ChatLogic";

function getNode(id: string): ChatNode | undefined {
  return graph.nodes[id];
}

export function useChatLogic() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState(graph.root);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sessionData, setSessionData] = useState<Record<string, string>>({});
  const [choicePath, setChoicePath] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentNode = getNode(currentNodeId) ?? getNode(graph.root)!;

  // Initialize session and push first bot message
  useEffect(() => {
    log.info(CTX, "Initializing chatbot — loading root node", { root: graph.root });

    const rootNode = getNode(graph.root);
    if (rootNode) {
      setHistory([{ type: "bot", content: rootNode.content }]);
      log.info(CTX, "Root node loaded successfully", { nodeId: graph.root, type: rootNode.type });
    } else {
      log.error(CTX, "Root node not found in knowledge graph", { root: graph.root });
    }

    const initSession = async () => {
      log.info(CTX, "Creating new session via /api/session");
      try {
        const res = await fetch("/api/session", { method: "POST" });
        if (res.ok) {
          const { session_id } = await res.json();
          setSessionId(session_id);
          log.info(CTX, "Session created successfully", { session_id });
        } else {
          log.warn(CTX, "Session creation returned non-OK status", { status: res.status });
        }
      } catch (err) {
        log.error(CTX, "Session creation failed (non-blocking)", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    };
    initSession();
  }, []);

  const trackEvent = useCallback(
    (nodeId: string, path: string[]) => {
      if (!sessionId) {
        log.debug(CTX, "Skipping trackEvent — no sessionId yet", { nodeId });
        return;
      }
      log.info(CTX, "Tracking event", { sessionId, nodeId, choicePath: path });
      fetch("/api/track-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          node_id: nodeId,
          choice_path: path,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            log.warn(CTX, "Track event API returned non-OK", { status: res.status, nodeId });
          } else {
            log.debug(CTX, "Track event recorded", { nodeId });
          }
        })
        .catch((err) => {
          log.error(CTX, "Track event request failed (non-blocking)", {
            error: err instanceof Error ? err.message : String(err),
          });
        });
    },
    [sessionId]
  );

  const submitLead = useCallback(
    (data: Record<string, string>) => {
      if (!sessionId) {
        log.warn(CTX, "Skipping submitLead — no sessionId", { dataKeys: Object.keys(data) });
        return;
      }
      log.info(CTX, "Submitting lead data", { sessionId, dataKeys: Object.keys(data) });
      fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, data }),
      })
        .then((res) => {
          if (!res.ok) {
            log.warn(CTX, "Submit lead API returned non-OK", { status: res.status });
          } else {
            log.info(CTX, "Lead submitted successfully", { sessionId });
          }
        })
        .catch((err) => {
          log.error(CTX, "Lead submission failed (non-blocking)", {
            error: err instanceof Error ? err.message : String(err),
          });
        });
    },
    [sessionId]
  );

  const navigateTo = useCallback(
    (nodeId: string, updatedSessionData: Record<string, string>, updatedChoicePath: string[]) => {
      log.info(CTX, "Navigating to node", { nodeId, choicePath: updatedChoicePath });

      const nextNode = getNode(nodeId);
      if (!nextNode) {
        log.error(CTX, "Navigation failed — node not found in graph", { nodeId });
        return;
      }

      log.debug(CTX, "Node resolved", { nodeId, type: nextNode.type });
      setCurrentNodeId(nodeId);
      setHistory((prev) => [...prev, { type: "bot", content: nextNode.content }]);

      trackEvent(nodeId, updatedChoicePath);

      // If terminal node, submit lead
      if (nextNode.type === "terminal") {
        log.info(CTX, "Terminal node reached — triggering lead submission", { nodeId });
        submitLead(updatedSessionData);
      }
    },
    [trackEvent, submitLead]
  );

  const onSelectOption = useCallback(
    (option: ChatOption) => {
      log.info(CTX, "User selected option", { label: option.label, next: option.next });
      const newPath = [...choicePath, option.label];
      setChoicePath(newPath);
      setHistory((prev) => [...prev, { type: "user", content: option.label }]);
      navigateTo(option.next, sessionData, newPath);
    },
    [choicePath, sessionData, navigateTo]
  );

  const onInputSubmit = useCallback(
    (value: string) => {
      if (currentNode.type !== "input") return;

      log.info(CTX, "User submitted input", { dataKey: currentNode.dataKey, value });
      const newData = { ...sessionData, [currentNode.dataKey]: value };
      setSessionData(newData);
      setHistory((prev) => [...prev, { type: "user", content: value }]);
      navigateTo(currentNode.next, newData, choicePath);
    },
    [currentNode, sessionData, choicePath, navigateTo]
  );

  const resetChat = useCallback(() => {
    log.info(CTX, "Chat reset by user");
    const rootNode = getNode(graph.root)!;
    setCurrentNodeId(graph.root);
    setHistory([{ type: "bot", content: rootNode.content }]);
    setSessionData({});
    setChoicePath([]);
    setError(null);
  }, []);

  return {
    currentNode,
    history,
    sessionData,
    sessionId,
    choicePath,
    isLoading,
    error,
    onSelectOption,
    onInputSubmit,
    resetChat,
  };
}
