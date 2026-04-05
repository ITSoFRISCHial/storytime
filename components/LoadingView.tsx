"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "Imagining your story...",
  "Drawing the pictures...",
  "Finding the perfect voices...",
  "Almost ready...",
];

export default function LoadingView() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6">
      {/* Spinner */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>

      <h2 className="text-2xl font-bold text-foreground">Creating your story</h2>
      <p className="text-lg text-text-muted text-center animate-pulse">
        {MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
