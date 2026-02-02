"use client";

import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-white/10 bg-gray-900/50 backdrop-blur-sm">
      <div className="flex gap-2 items-end">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-gray-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed max-h-24"
          style={{
            minHeight: "44px",
            lineHeight: "1.5",
          }}
        />
        
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 text-white flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-105 active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Presiona <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400">Enter</kbd> para enviar, <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400">Shift+Enter</kbd> para nueva línea
      </p>
    </div>
  );
}
