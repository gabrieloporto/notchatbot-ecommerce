"use client";

import { type ChatMessage as ChatMessageType } from "../context/ChatContext";
import ChatProductCard from "./ChatProductCard";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-black"
            : "bg-gray-200 dark:bg-gray-800"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-gray-900 dark:text-gray-100" />
        )}
      </div>

      {/* Contenido del mensaje */}
      <div className={`flex-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Bubble del mensaje */}
        <div
          className={`px-4 py-3 rounded-2xl max-w-[85%] ${
            isUser
              ? "bg-black text-white rounded-br-sm"
              : "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-bl-sm"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Productos (solo para mensajes del asistente) */}
        {!isUser && message.products && message.products.length > 0 && (
          <div className="mt-3 space-y-2 w-full max-w-[85%]">
            {message.products.map((product) => (
              <ChatProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-500 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
