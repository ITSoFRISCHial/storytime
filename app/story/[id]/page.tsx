"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SavedStory } from "@/types/story";
import { getStoryById } from "@/lib/storage";
import StoryView from "@/components/StoryView";

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<SavedStory | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const found = getStoryById(id);
    if (found) {
      setStory(found);
    } else {
      setNotFound(true);
    }
  }, [params.id]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-screen gap-4 px-6">
        <h1 className="text-2xl font-bold text-foreground">Story not found</h1>
        <button
          onClick={() => router.push("/")}
          className="py-3 px-6 bg-primary text-white font-bold rounded-2xl"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <StoryView story={story} onNewStory={() => router.push("/")} />
    </div>
  );
}
