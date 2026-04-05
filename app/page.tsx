"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { SavedStory, StoryOptions, StoryGenerationSchema } from "@/types/story";
import { getSavedStories, saveStory } from "@/lib/storage";
import RecordingView from "@/components/RecordingView";
import ConfirmView from "@/components/ConfirmView";
import StoryView from "@/components/StoryView";
import LoadingView from "@/components/LoadingView";
import StoryCard from "@/components/StoryCard";
import GateView from "@/components/GateView";

type AppScreen = "gate" | "home" | "confirm" | "loading" | "story";


export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("gate");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentStory, setCurrentStory] = useState<SavedStory | null>(null);
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if already authenticated (cookie present)
    fetch("/api/gate")
      .then((r) => { if (r.ok) setScreen("home"); })
      .catch(() => {});
    setSavedStories(getSavedStories());
  }, []);

  const handleRecordingComplete = useCallback((blob: Blob, duration: number) => {
    setAudioBlob(blob);
    setAudioDuration(duration);
    setScreen("confirm");
  }, []);

  const handleConfirm = useCallback(async (options: StoryOptions) => {
    if (!audioBlob) return;
    setError(null);
    setImageError(false);
    setAudioError(false);
    setScreen("loading");

    try {
      // Step 1: Transcribe
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) {
        const err = await transcribeRes.json();
        throw new Error(err.error || "Transcription failed");
      }

      const { transcript } = await transcribeRes.json();

      // Step 2: Generate story with Claude
      const storyRes = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, options }),
      });

      if (!storyRes.ok) {
        const err = await storyRes.json();
        throw new Error(err.error || "Story generation failed");
      }

      const storyData = StoryGenerationSchema.parse(await storyRes.json());

      const story: SavedStory = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        title: storyData.title,
        transcript,
        options,
        story: storyData.story,
        simpleStory: storyData.simple_story,
        imageUrl: null,
        audioUrl: null,
        characters: storyData.characters,
        scenes: storyData.scenes,
      };

      saveStory(story); // persist text immediately; image/audio patch in below
      setCurrentStory(story);
      setScreen("story");

      // Fire image + audio in parallel; update story as each resolves
      const updateStory = (patch: Partial<SavedStory>) => {
        setCurrentStory((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, ...patch };
          saveStory(updated);
          return updated;
        });
      };

      Promise.all([
        fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: storyData.image_prompt }),
        })
          .then((r) => r.json())
          .then((d) => { if (d.url) updateStory({ imageUrl: d.url }); else setImageError(true); })
          .catch((e) => { console.error("Image generation failed:", e); setImageError(true); }),

        fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenes: storyData.scenes, characters: storyData.characters }),
        })
          .then((r) => r.json())
          .then((d) => { if (d.url) updateStory({ audioUrl: d.url }); else setAudioError(true); })
          .catch((e) => { console.error("TTS failed:", e); setAudioError(true); }),
      ]);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setScreen("confirm");
    }
  }, [audioBlob]);

  const handleReRecord = useCallback(() => {
    setAudioBlob(null);
    setAudioDuration(0);
    setScreen("home");
  }, []);

  const handleNewStory = useCallback(() => {
    setAudioBlob(null);
    setAudioDuration(0);
    setCurrentStory(null);
    setImageError(false);
    setAudioError(false);
    setScreen("home");
    setSavedStories(getSavedStories());
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  const handleViewStory = useCallback((story: SavedStory) => {
    setCurrentStory(story);
    setScreen("story");
  }, []);

  if (screen === "gate") {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <GateView onAuthenticated={() => { setSavedStories(getSavedStories()); setScreen("home"); }} />
      </div>
    );
  }

  // Home screen (mic + saved stories)
  if (screen === "home") {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <div ref={topRef} className="flex flex-col flex-1">
          <RecordingView onRecordingComplete={handleRecordingComplete} />
        </div>

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

  if (screen === "confirm" && audioBlob) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <ConfirmView
          audioBlob={audioBlob}
          durationSeconds={audioDuration}
          onConfirm={handleConfirm}
          onReRecord={handleReRecord}
          error={error}
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
        <StoryView story={currentStory} onNewStory={handleNewStory} imageError={imageError} audioError={audioError} />
      </div>
    );
  }

  return null;
}
