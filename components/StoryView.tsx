"use client";

import { useState } from "react";
import { SavedStory } from "@/types/story";
import AudioControls from "./AudioControls";

interface StoryViewProps {
  story: SavedStory;
  onNewStory: () => void;
  imageError?: boolean;
  audioError?: boolean;
}

type ReadMode = "read-to-me" | "i-read";

export default function StoryView({ story, onNewStory, imageError, audioError }: StoryViewProps) {
  const [mode, setMode] = useState<ReadMode>("read-to-me");

  return (
    <div className="flex flex-col flex-1 px-6 py-6 gap-5 max-w-lg mx-auto w-full">
      {/* Image */}
      <div className="w-full aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center relative">
        {story.imageUrl ? (
          <img
            src={story.imageUrl}
            alt={`Illustration for ${story.title}`}
            className="w-full h-full object-cover"
          />
        ) : imageError ? (
          <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-300">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            <p className="text-xs text-gray-400">Picture unavailable</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-400 animate-pulse">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
              <p className="text-sm font-semibold text-gray-400">Drawing your picture...</p>
            </div>
          </div>
        )}
      </div>

      {/* Audio — right under the image */}
      {mode === "read-to-me" && (
        story.audioUrl ? (
          <AudioControls audioUrl={story.audioUrl} />
        ) : audioError ? (
          <div className="bg-surface rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-text-muted text-center">Audio unavailable</p>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex-1">
                <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary/30 rounded-full animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
                </div>
                <p className="text-sm text-text-muted mt-2">Creating audio...</p>
              </div>
            </div>
          </div>
        )
      )}

      {/* Title */}
      <h1 className="text-2xl font-extrabold text-foreground text-center">
        {story.title}
      </h1>

      {/* Mode toggle */}
      <div className="flex bg-surface rounded-2xl p-1 shadow-sm">
        <button
          onClick={() => setMode("read-to-me")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
            mode === "read-to-me"
              ? "bg-primary text-white shadow-sm"
              : "text-text-muted"
          }`}
        >
          Read to me
        </button>
        <button
          onClick={() => setMode("i-read")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
            mode === "i-read"
              ? "bg-primary text-white shadow-sm"
              : "text-text-muted"
          }`}
        >
          I read myself
        </button>
      </div>

      {/* Story text */}
      <div
        className={`flex-1 bg-surface rounded-2xl p-5 shadow-sm overflow-y-auto ${
          mode === "i-read" ? "text-xl leading-relaxed" : "text-base leading-7"
        }`}
      >
        {(mode === "i-read" ? story.simpleStory : story.story)
          .split("\n")
          .filter((p) => p.trim())
          .map((paragraph, i) => (
            <p key={i} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
      </div>

      {/* New story button */}
      <button
        onClick={onNewStory}
        className="w-full py-3 bg-accent text-white text-lg font-bold rounded-2xl active:scale-[0.98] transition-all mt-auto"
      >
        New Story
      </button>
    </div>
  );
}
