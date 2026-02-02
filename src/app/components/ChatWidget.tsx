"use client";

import { useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { X, Trash2, MessageCircle, Sparkles } from "lucide-react";

export default function ChatWidget() {
  const { messages, isOpen, isLoading, sendMessage, toggleChat, clearHistory } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110 active:scale-95"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
        </button>
      )}

      {/* Contenedor del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300 bg-gray-900/95 backdrop-blur-xl border border-white/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">NexoShop Assistant</h3>
                <p className="text-white/80 text-xs">Siempre listo para ayudarte</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Limpiar historial"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              )}
              <button
                onClick={toggleChat}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(650px-140px)] bg-gradient-to-b from-gray-900 to-gray-950">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="text-white font-medium mb-2">¡Hola! 👋</h4>
                  <p className="text-gray-400 text-sm">
                    Soy tu asistente de NexoShop. Pregúntame sobre productos, stock, precios o cualquier cosa que necesites.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-300" />
                    </div>
                    <TypingIndicator />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      )}
    </>
  );
}
