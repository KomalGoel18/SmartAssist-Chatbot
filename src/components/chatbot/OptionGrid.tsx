"use client";

import type { ChatOption } from "@/src/types/chatbot";

interface OptionGridProps {
  options: ChatOption[];
  onSelect: (option: ChatOption) => void;
  disabled?: boolean;
}

export default function OptionGrid({
  options,
  onSelect,
  disabled,
}: OptionGridProps) {
  if (!options || options.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 pl-10">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="w-full text-left px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
