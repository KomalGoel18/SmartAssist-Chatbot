"use client";

import { useState, useEffect, useRef } from "react";
import { useChatLogic } from "@/src/hooks/useChatLogic";
import OptionGrid from "./OptionGrid";
import InputCapture from "./InputCapture";
import type { InputNode } from "@/src/types/chatbot";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const {
    currentNode,
    history,
    onSelectOption,
    onInputSubmit,
    resetChat,
  } = useChatLogic();

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 w-full max-w-[350px]">
      
      {open && (
        <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E6E2FF] flex flex-col">
          
          {/* Header */}
          <div className="bg-[#7C6CF6] p-4 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">
                ARULA Support
              </h3>
              <p className="text-white/80 text-xs">
                You’re not alone 💜
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white">
              ✕
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-100 bg-[#F4F2FF]">
            {history.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "items-end gap-2"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                    msg.type === "bot"
                      ? "bg-white text-gray-700 shadow-sm"
                      : "bg-[#7C6CF6] text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {currentNode.type === "info" || currentNode.type === "choice" ? (
              <OptionGrid
                options={currentNode.options ?? []}
                onSelect={onSelectOption}
              />
            ) : currentNode.type === "input" ? (
              <InputCapture
                node={currentNode as InputNode}
                onSubmit={onInputSubmit}
              />
            ) : null}

            <div ref={chatEndRef}></div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#E6E2FF]">
            <button
              onClick={resetChat}
              className="w-full text-sm text-[#5B4FE3] font-medium"
            >
              Start Again
            </button>
          </div>
        </div>
      )}

      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="size-14 bg-[#7C6CF6] rounded-full text-white shadow-lg hover:scale-105 transition-all"
        >
          💬
        </button>
      )}
    </div>
  );
}