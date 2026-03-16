"use client";

import { useState } from "react";
import type { InputNode } from "@/src/types/chatbot";

interface InputCaptureProps {
  node: InputNode;
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

function getInputType(dataKey: string): string {
  if (dataKey.includes("email")) return "email";
  if (dataKey.includes("date")) return "date";
  if (dataKey.includes("time")) return "time";
  return "text";
}

export default function InputCapture({
  node,
  onSubmit,
  disabled,
}: InputCaptureProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 pl-10">
      <input
        type={getInputType(node.dataKey)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type your answer..."
        className="flex-1 px-3 py-2 rounded-lg border border-blue-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  );
}
