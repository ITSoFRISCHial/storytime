"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { StoryOptions } from "@/types/story";

interface ConfirmViewProps {
  audioBlob: Blob;
  durationSeconds: number;
  onConfirm: (options: StoryOptions) => void;
  onReRecord: () => void;
}

export default function ConfirmView({
  audioBlob,
  durationSeconds,
  onConfirm,
  onReRecord,
}: ConfirmViewProps) {
  const [options, setOptions] = useState<StoryOptions>({
    onceUponATime: true,
    happilyEverAfter: true,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(durationSeconds);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    audioUrlRef.current = url;
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };
    audio.ontimeupdate = () => {
      if (!isDraggingRef.current && audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTime(audio.currentTime);
      }
    };
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audio.pause();
    };
  }, [audioBlob]);

  function togglePlayback() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  const seekTo = useCallback((clientX: number) => {
    if (!trackRef.current || !audioRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setProgress(ratio);
    setCurrentTime(ratio * (audioRef.current.duration || audioDuration));
    audioRef.current.currentTime = ratio * (audioRef.current.duration || audioDuration);
  }, [audioDuration]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    seekTo(e.clientX);
  }, [seekTo]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    seekTo(e.clientX);
  }, [seekTo]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-col items-center flex-1 px-6 py-8 gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto text-primary">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Your Recording</h2>
      </div>

      {/* Audio preview with scrubber */}
      <div className="bg-surface rounded-2xl p-5 w-full max-w-sm shadow-sm space-y-3">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayback}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
            aria-label={isPlaying ? "Pause" : "Play recording"}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Scrubber track */}
          <div className="flex-1 flex flex-col gap-1">
            <div
              ref={trackRef}
              className="relative h-6 flex items-center cursor-pointer touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Track background */}
              <div className="absolute inset-x-0 h-2 bg-primary/20 rounded-full" />
              {/* Track fill */}
              <div
                className="absolute left-0 h-2 bg-primary rounded-full"
                style={{ width: `${progress * 100}%` }}
              />
              {/* Thumb */}
              <div
                className="absolute w-5 h-5 bg-primary rounded-full shadow-md -translate-x-1/2 transition-transform active:scale-125"
                style={{ left: `${progress * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-muted tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(audioDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Re-record */}
      <button
        onClick={onReRecord}
        className="text-accent font-semibold text-base hover:underline"
      >
        Re-record
      </button>

      {/* Story options */}
      <div className="w-full max-w-sm space-y-3 mt-2">
        <label
          className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all ${
            options.onceUponATime
              ? "bg-primary/10 border-2 border-primary"
              : "bg-surface border-2 border-transparent"
          }`}
        >
          <input
            type="checkbox"
            checked={options.onceUponATime}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, onceUponATime: e.target.checked }))
            }
            className="sr-only"
          />
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              options.onceUponATime ? "bg-primary" : "bg-gray-200"
            }`}
          >
            {options.onceUponATime && (
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>
          <span className="text-lg font-semibold">Once upon a time</span>
        </label>

        <label
          className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all ${
            options.happilyEverAfter
              ? "bg-primary/10 border-2 border-primary"
              : "bg-surface border-2 border-transparent"
          }`}
        >
          <input
            type="checkbox"
            checked={options.happilyEverAfter}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, happilyEverAfter: e.target.checked }))
            }
            className="sr-only"
          />
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              options.happilyEverAfter ? "bg-primary" : "bg-gray-200"
            }`}
          >
            {options.happilyEverAfter && (
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>
          <span className="text-lg font-semibold">Happily ever after</span>
        </label>
      </div>

      {/* Go button */}
      <div className="mt-auto w-full max-w-sm pt-4">
        <button
          onClick={() => onConfirm(options)}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white text-xl font-bold rounded-2xl shadow-md active:scale-[0.98] transition-all"
        >
          Go!
        </button>
      </div>
    </div>
  );
}
