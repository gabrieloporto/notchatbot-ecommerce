"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  products?: Array<{
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
    description?: string;
  }>;
}

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
  clearHistory: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = "nexoshop-chat-history";

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar historial del localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  }, []);

  // Guardar historial en localStorage cuando cambian los mensajes
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            messages,
            lastUpdated: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    // Agregar mensaje del usuario
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Construir historial para la API (solo últimos 10 mensajes)
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Llamar a la API de chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al obtener respuesta del chatbot");
      }

      const data = await response.json();

      // Agregar respuesta del asistente
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        products: data.products || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Mensaje de error
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        sendMessage,
        toggleChat,
        clearHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
