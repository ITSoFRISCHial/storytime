"use client";

import { SavedStory } from "@/types/story";

interface StoryCardProps {
  story: SavedStory;
  onClick: () => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left w-full active:scale-[0.98]"
    >
      <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
        {story.imageUrl ? (
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-3xl">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-400">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-foreground truncate">{story.title}</h3>
        <p className="text-xs text-text-muted mt-1">
          {new Date(story.createdAt).toLocaleDateString()}
        </p>
      </div>
    </button>
  );
}
