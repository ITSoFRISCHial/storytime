"use client";

import { useState, useEffect, useCallback } from "react";
import { SavedStory, StoryOptions } from "@/types/story";
import { getSavedStories } from "@/lib/storage";
import RecordingView from "@/components/RecordingView";
import ConfirmView from "@/components/ConfirmView";
import StoryView from "@/components/StoryView";
import LoadingView from "@/components/LoadingView";
import StoryCard from "@/components/StoryCard";

type AppScreen = "home" | "recording" | "confirm" | "loading" | "story";

// Mock story for development
const MOCK_STORY: SavedStory = {
  id: "mock-1",
  createdAt: new Date().toISOString(),
  title: "The Brave Little Fox",
  transcript: "a story about a fox who goes on an adventure",
  options: { onceUponATime: true, happilyEverAfter: true },
  story: "Once upon a time, in a forest full of tall green trees and soft golden light, there lived a little fox named Rosie. Rosie had the fluffiest red tail in the whole forest, and she loved to explore.\n\nOne morning, Rosie found a trail of sparkling blue stones she had never seen before. \"Where do these go?\" she wondered, her ears perking up with excitement.\n\nShe followed the stones through the meadow, past the old oak tree, and all the way to a hidden pond. There, sitting on a lily pad, was a tiny frog wearing a crown made of daisies.\n\n\"Hello!\" said the frog. \"I'm Prince Pip. I've been waiting for someone brave enough to find me!\"\n\n\"I'm Rosie,\" she said with a smile. \"What are you doing out here all alone?\"\n\n\"I lost my way home,\" Pip said sadly. \"Could you help me find it?\"\n\nRosie nodded. Together, they hopped and trotted through the forest. Rosie used her sharp nose to sniff out the path, and Pip sang a little song to keep them cheerful.\n\nAt last, they found Pip's home — a cozy log by the stream, covered in soft moss and tiny flowers. Pip's family cheered when they saw him.\n\n\"Thank you, Rosie!\" said Pip. \"You're the bravest fox I've ever met.\"\n\nRosie wagged her fluffy tail. She had made a new friend, and that was the best adventure of all.\n\nAnd they all lived happily ever after.",
  simpleStory: "Rosie is a little fox. She has a red tail. She likes to play.\n\nOne day she sees blue rocks. She follows them. She finds a frog.\n\nThe frog is Pip. He is lost. Rosie helps him.\n\nThey walk and walk. They find his home.\n\nPip says thank you. Rosie is happy.\n\nThey are friends now.",
  imageUrl: null,
  audioUrl: null,
  characters: [
    { name: "Narrator", voiceStyle: "warm, calm", description: "Story narrator" },
    { name: "Rosie", voiceStyle: "bright, energetic", description: "A brave little fox" },
    { name: "Pip", voiceStyle: "playful, small", description: "A tiny frog prince" },
  ],
  scenes: [
    { speaker: "Narrator", text: "Once upon a time, in a forest full of tall green trees..." },
    { speaker: "Rosie", text: "Where do these go?" },
    { speaker: "Pip", text: "Hello! I'm Prince Pip." },
  ],
};

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentStory, setCurrentStory] = useState<SavedStory | null>(null);
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);

  useEffect(() => {
    setSavedStories(getSavedStories());
  }, []);

  const handleRecordingComplete = useCallback((blob: Blob, duration: number) => {
    setAudioBlob(blob);
    setAudioDuration(duration);
    setScreen("confirm");
  }, []);

  const handleConfirm = useCallback((_options: StoryOptions) => {
    // For now, show mock story after a brief loading state
    setScreen("loading");
    setTimeout(() => {
      setCurrentStory(MOCK_STORY);
      setScreen("story");
    }, 2000);
  }, []);

  const handleReRecord = useCallback(() => {
    setAudioBlob(null);
    setAudioDuration(0);
    setScreen("recording");
  }, []);

  const handleNewStory = useCallback(() => {
    setAudioBlob(null);
    setAudioDuration(0);
    setCurrentStory(null);
    setScreen("home");
    setSavedStories(getSavedStories());
  }, []);

  const handleViewStory = useCallback((story: SavedStory) => {
    setCurrentStory(story);
    setScreen("story");
  }, []);

  // Home screen
  if (screen === "home") {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6 py-12">
          <h1 className="text-5xl font-extrabold text-foreground tracking-tight">
            Storytime
          </h1>
          <p className="text-lg text-text-muted text-center max-w-xs">
            What should your story be about?
          </p>
          <button
            onClick={() => setScreen("recording")}
            className="w-full max-w-xs py-4 bg-primary hover:bg-primary-dark text-white text-xl font-bold rounded-2xl shadow-md active:scale-[0.98] transition-all"
          >
            Storytime
          </button>
        </div>

        {/* Recent stories */}
        {savedStories.length > 0 && (
          <div className="px-6 pb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Recent Stories</h2>
            <div className="grid grid-cols-2 gap-4">
              {savedStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onClick={() => handleViewStory(story)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen === "recording") {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <RecordingView onRecordingComplete={handleRecordingComplete} />
      </div>
    );
  }

  if (screen === "confirm" && audioBlob) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <ConfirmView
          audioBlob={audioBlob}
          durationSeconds={audioDuration}
          onConfirm={handleConfirm}
          onReRecord={handleReRecord}
        />
      </div>
    );
  }

  if (screen === "loading") {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <LoadingView />
      </div>
    );
  }

  if (screen === "story" && currentStory) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <StoryView story={currentStory} onNewStory={handleNewStory} />
      </div>
    );
  }

  return null;
}
