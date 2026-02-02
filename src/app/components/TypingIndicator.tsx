"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 max-w-fit rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="flex gap-1">
        <span
          className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
