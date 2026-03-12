"use client";

import { useState, useEffect, useRef } from "react";
import { useChatbot } from "@/src/hooks/useChatbot";
import { PopupModal } from "react-calendly";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);

  const { node, messages, selectOption, resetChat } = useChatbot();

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (node?.message === "Opening booking calendar for your appointment.") {
      setShowCalendly(true);
    }
  }, [node]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 w-full max-w-[350px]">

      {/* Chat Window */}
      {open && (
        <div className="w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in fade-in zoom-in duration-200">

          {/* Header */}
          <div className="bg-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                  🤖
                </div>
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-blue-600"></span>
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">
                  SmartAssist
                </h3>
                <p className="text-white/80 text-xs">
                  Online
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-white text-lg hover:scale-110 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-100">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "items-end gap-2"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    🤖
                  </div>
                )}

                <div
                  className={`p-3 rounded-xl text-sm max-w-[85%] ${
                    msg.sender === "bot"
                      ? "bg-slate-100 text-slate-800 rounded-bl-none"
                      : "bg-blue-600 text-white rounded-br-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Options */}
            <div className="flex flex-col gap-2 pl-10">
              {node?.options?.map(
                (
                  option: { label: string; next: string },
                  index: number
                ) => (
                <button
                  key={index}
                  onClick={() => selectOption(option.label, option.next)}
                  className="w-full text-left px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 text-sm font-medium transition-all"
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div ref={chatEndRef}></div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={resetChat}
              className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all"
            >
              Restart Chat
            </button>

            <div className="mt-2 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                Powered by SmartAssist
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="size-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200"
        >
          💬
        </button>
      )}

      {/* Calendly Modal */}
      {showCalendly && (
        <PopupModal
          url="https://calendly.com/goelkomal836/new-meeting"
          onModalClose={() => setShowCalendly(false)}
          open={showCalendly}
          rootElement={document.body}
          pageSettings={{
            hideEventTypeDetails: false,
            hideLandingPageDetails: false,
            primaryColor: "2563eb",
            textColor: "0f172a",
            backgroundColor: "ffffff",
          }}
        />
      )}
    </div>
  );
}
