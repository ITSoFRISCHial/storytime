"use client";

import { useState } from "react";

interface GateViewProps {
  onAuthenticated: () => void;
}

export default function GateView({ onAuthenticated }: GateViewProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (res.ok) {
        onAuthenticated();
      } else {
        setError(true);
        setPassword("");
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-screen px-8 gap-8">
      <h1 className="text-5xl font-extrabold text-foreground tracking-tight">
        Storytime
      </h1>

      <p className="text-xl text-text-muted text-center">
        What&apos;s the secret word?
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          placeholder="password"
          autoFocus
          className={`w-full text-center text-2xl font-bold py-4 px-6 rounded-2xl border-2 outline-none transition-colors ${
            error
              ? "border-accent bg-accent/10 text-accent placeholder-accent/50"
              : "border-primary/30 bg-surface text-foreground focus:border-primary"
          }`}
        />

        {error && (
          <p className="text-accent font-semibold text-center text-lg">
            Try again!
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-xl font-bold rounded-2xl shadow-md active:scale-[0.98] transition-all"
        >
          {loading ? "..." : "Let me in!"}
        </button>
      </form>
    </div>
  );
}
