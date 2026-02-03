"use client";

import { memo, useCallback, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "../hooks/useProductSearch";
import { ProductSearchResults } from "./ProductSearchResults";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal = memo(function SearchModal({
  isOpen,
  onClose,
}: SearchModalProps) {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    isVisible,
    setIsVisible,
  } = useProductSearch();

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

  const handleClose = useCallback(() => {
    setQuery("");
    setIsVisible(false);
    onClose();
  }, [onClose, setQuery, setIsVisible]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-top duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 border-b p-4">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar búsqueda"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={query}
              onChange={handleInputChange}
              className="pr-4 pl-11 h-12 text-base"
              aria-label="Buscar productos"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {isVisible && (
            <ProductSearchResults
              results={results}
              isLoading={isLoading}
              error={error}
              query={query}
              onResultClick={handleClose}
              variant="mobile"
            />
          )}

          {!isVisible && query.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Busca productos por nombre, categoría o descripción</p>
            </div>
          )}

          {!isVisible && query.length > 0 && query.length < 2 && (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">Escribe al menos 2 caracteres para buscar</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
});
