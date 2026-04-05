import { SavedStory } from "@/types/story";

const STORIES_KEY = "storytime_stories";
const GATE_KEY = "storytime_gate_password";

export function getSavedStories(): SavedStory[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORIES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedStory[];
  } catch {
    return [];
  }
}

export function saveStory(story: SavedStory): void {
  const stories = getSavedStories();
  const existing = stories.findIndex((s) => s.id === story.id);
  if (existing >= 0) {
    stories[existing] = story;
  } else {
    stories.unshift(story);
  }
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
}

export function getStoryById(id: string): SavedStory | undefined {
  return getSavedStories().find((s) => s.id === id);
}

export function getGatePassword(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GATE_KEY);
}

export function setGatePassword(password: string): void {
  localStorage.setItem(GATE_KEY, password);
}
