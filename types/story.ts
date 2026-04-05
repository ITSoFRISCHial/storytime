import { z } from "zod";

// --- Zod Schemas ---

export const StoryOptionsSchema = z.object({
  onceUponATime: z.boolean(),
  happilyEverAfter: z.boolean(),
});

export const CharacterSchema = z.object({
  name: z.string(),
  voiceStyle: z.string(),
  description: z.string(),
});

export const SceneSchema = z.object({
  speaker: z.string(),
  text: z.string(),
});

export const SafetyNotesSchema = z.object({
  is_safe: z.boolean(),
  notes: z.string(),
});

export const StoryGenerationSchema = z.object({
  title: z.string(),
  characters: z.array(CharacterSchema).max(4),
  scenes: z.array(SceneSchema).min(1),
  story: z.string(),
  simple_story: z.string(),
  image_prompt: z.string(),
  safety_notes: SafetyNotesSchema,
});

export const SavedStorySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  title: z.string(),
  transcript: z.string(),
  options: StoryOptionsSchema,
  story: z.string(),
  simpleStory: z.string(),
  imageUrl: z.string().nullable(),
  audioUrl: z.string().nullable(),
  characters: z.array(CharacterSchema),
  scenes: z.array(SceneSchema),
});

// --- TypeScript Types ---

export type StoryOptions = z.infer<typeof StoryOptionsSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type SafetyNotes = z.infer<typeof SafetyNotesSchema>;
export type StoryGeneration = z.infer<typeof StoryGenerationSchema>;
export type SavedStory = z.infer<typeof SavedStorySchema>;
