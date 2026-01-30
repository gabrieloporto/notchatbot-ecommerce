"use client";

import { memo, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "../hooks/useProductSearch";
import { ProductSearchResults } from "./ProductSearchResults";

export const ProductSearch = memo(function ProductSearch() {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    isVisible,
    setIsVisible,
  } = useProductSearch();

  const searchRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      if (value.length >= 2) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    },
    [setQuery, setIsVisible],
  );

  const handleInputFocus = useCallback(() => {
    if (query.length >= 2) {
      setIsVisible(true);
    }
  }, [query.length, setIsVisible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsVisible]);

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pr-4 pl-10"
          aria-label="Buscar productos"
        />
      </div>

      {isVisible && (
        <ProductSearchResults
          results={results}
          isLoading={isLoading}
          error={error}
          query={query}
        />
      )}
    </div>
  );
});
