"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface AudioControlsProps {
  audioUrl: string;
}

export default function AudioControls({ audioUrl }: AudioControlsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.ontimeupdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  function restart() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * duration;
    setProgress(ratio);
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="w-full space-y-3">
      {/* Progress bar */}
      <div
        className="h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-primary rounded-full transition-[width] duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-xs text-text-muted tabular-nums">
        <span>{formatTime(progress * duration)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={restart}
          className="w-12 h-12 rounded-full bg-surface flex items-center justify-center active:scale-95 transition-transform shadow-sm"
          aria-label="Restart"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-foreground">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-primary flex items-center justify-center active:scale-95 transition-transform shadow-md"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
