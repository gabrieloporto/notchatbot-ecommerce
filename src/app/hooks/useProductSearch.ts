"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface UseProductSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: Product[];
  isLoading: boolean;
  error: string | null;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const DEBOUNCE_DELAY = 300;
const MIN_SEARCH_LENGTH = 2;

export function useProductSearch(): UseProductSearchReturn {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/products/search?q=${encodeURIComponent(searchQuery)}`,
        {
          signal: abortControllerRef.current.signal,
        },
      );

      if (!response.ok) {
        throw new Error("Error al buscar productos");
      }

      const data = (await response.json()) as Product[];
      setResults(data);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Error al cargar los resultados");
        console.error("Error en búsqueda:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      void searchProducts(query);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, searchProducts]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    isVisible,
    setIsVisible,
  };
}
