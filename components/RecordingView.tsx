"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface RecordingViewProps {
  onRecordingComplete: (audioBlob: Blob, durationSeconds: number) => void;
}

export default function RecordingView({ onRecordingComplete }: RecordingViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const MAX_DURATION = 30;

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    if (isRecording && elapsed >= MAX_DURATION) {
      stopRecording();
    }
  }, [elapsed, isRecording, stopRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        stream.getTracks().forEach((t) => t.stop());
        onRecordingComplete(blob, elapsed);
      };

      setElapsed(0);
      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch {
      alert("Could not access the microphone. Please allow microphone access and try again.");
    }
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6">
      <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
        Storytime
      </h1>

      <p className="text-lg text-text-muted text-center max-w-xs">
        {isRecording
          ? "Tell me what your story is about!"
          : "Tap the microphone to start"}
      </p>

      {/* Mic / Stop button */}
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" />
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center text-5xl transition-all shadow-lg active:scale-95 ${
            isRecording
              ? "bg-accent animate-recording-pulse"
              : "bg-primary hover:bg-primary-dark"
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? (
            <div className="w-12 h-12 bg-white rounded-md" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="white"
              className="w-14 h-14"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Timer */}
      {isRecording && (
        <div className="text-3xl font-bold text-foreground tabular-nums">
          {formatTime(elapsed)}
          <span className="text-sm font-normal text-text-muted ml-2">
            / {formatTime(MAX_DURATION)}
          </span>
        </div>
      )}
    </div>
  );
}
