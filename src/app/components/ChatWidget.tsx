"use client";

import { useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { useCart } from "../context/CartContext";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { X, Trash2, MessageCircle, Sparkles } from "lucide-react";

export default function ChatWidget() {
  const { messages, isOpen, isLoading, sendMessage, toggleChat, clearHistory } = useChat();
  const { shouldOpenCart } = useCart(); // Detectar si el carrito está abierto
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <>
      {/* Botón flotante - oculto cuando el carrito está abierto */}
      {!isOpen && !shouldOpenCart && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-black hover:bg-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110 active:scale-95"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-900 animate-pulse" />
        </button>
      )}

      {/* Contenedor del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex flex-col">
          {/* Header - FIXED */}
          <div className="flex-shrink-0 bg-black border-b border-gray-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">NexoShop Assistant</h3>
                <p className="text-gray-400 text-xs">Siempre listo para ayudarte</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
                  title="Limpiar historial"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                onClick={toggleChat}
                className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Área de mensajes - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-gray-900 dark:text-gray-100" />
                  </div>
                  <h4 className="text-gray-900 dark:text-white font-medium mb-2">¡Hola! 👋</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
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
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </div>
                    <TypingIndicator />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input - FIXED */}
          <div className="flex-shrink-0">
            <ChatInput onSend={sendMessage} disabled={isLoading} />
          </div>
        </div>
      )}
    </>
  );
}
