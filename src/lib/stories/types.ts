/**
 * NUR Lingo — Story System Architecture
 *
 * Data models for the upcoming interactive story feature.
 * Covers: fairy tales, dialogues, books, adventures.
 * These types are ready-to-use for UI and Supabase integration.
 */

import type { LangCode } from "@/lib/i18n/multilingual";

// ─── Multilingual string shorthand ───────────────────────────────────────────

export type MultiString = Record<LangCode, string>;

// ─── Core entities ────────────────────────────────────────────────────────────

export type StoryType = "fairy_tale" | "dialogue" | "book" | "adventure" | "fable";
export type StoryDifficulty = "A1" | "A2" | "B1" | "B2" | "C1";
export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "fill_blank";

// ─── StoryImage ───────────────────────────────────────────────────────────────

export interface StoryImage {
  id: string;
  url: string;
  altText: MultiString;
  caption?: MultiString;
  width?: number;
  height?: number;
}

// ─── StoryAudio ───────────────────────────────────────────────────────────────

export interface StoryAudio {
  id: string;
  lang: LangCode;
  url: string;           // path to MP3 or Supabase storage URL
  durationSec?: number;
  isTTSGenerated?: boolean;
}

// ─── StoryVocabulary ──────────────────────────────────────────────────────────

export interface StoryVocabulary {
  id: string;
  word: MultiString;
  definition: MultiString;
  partOfSpeech?: string;
  audioId?: string;
  imageId?: string;
  exampleSentence?: MultiString;
}

// ─── StoryQuestion ────────────────────────────────────────────────────────────

export interface StoryQuestion {
  id: string;
  type: QuestionType;
  prompt: MultiString;
  options?: MultiString[];          // for multiple_choice
  correctOptionIndex?: number;      // for multiple_choice
  correctAnswer?: MultiString;      // for short_answer / fill_blank
  explanation?: MultiString;
  hayqReward: number;
}

// ─── StorySentence ────────────────────────────────────────────────────────────

export interface StorySentence {
  id: string;
  text: MultiString;
  audioIds?: Partial<Record<LangCode, string>>;   // one audio per language
  vocabularyIds?: string[];                        // highlights in this sentence
  speaker?: string;                               // for dialogue stories
  imageId?: string;                               // per-sentence illustration
}

// ─── StoryPage ────────────────────────────────────────────────────────────────

export interface StoryPage {
  id: string;
  pageNumber: number;
  title?: MultiString;
  sentences: StorySentence[];
  backgroundImageId?: string;
  questions?: StoryQuestion[];      // comprehension questions after this page
  vocabulary?: StoryVocabulary[];   // new words introduced on this page
  audioIds?: Partial<Record<LangCode, string>>; // full-page narration audio
}

// ─── StoryChapter ─────────────────────────────────────────────────────────────

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: MultiString;
  summary?: MultiString;
  pages: StoryPage[];
  coverImageId?: string;
  unlockRequirement?: {
    minLessonId?: string;
    minStreak?: number;
    minHAYQ?: number;
  };
}

// ─── StoryProgress ────────────────────────────────────────────────────────────

export interface StoryProgress {
  storyId: string;
  deviceId: string;
  currentChapterIndex: number;
  currentPageIndex: number;
  completedChapterIds: string[];
  completedPageIds: string[];
  answeredQuestionIds: string[];
  totalHAYQEarned: number;
  startedAt: string;
  lastReadAt: string;
  completedAt?: string;
}

// ─── Story (root) ─────────────────────────────────────────────────────────────

export interface Story {
  id: string;
  type: StoryType;
  title: MultiString;
  description: MultiString;
  difficulty: StoryDifficulty;
  ageRating?: number;               // minimum age in years
  coverImageId?: string;
  previewImageIds?: string[];
  authors?: string[];
  chapters: StoryChapter[];
  vocabulary: StoryVocabulary[];    // global story vocabulary
  images: StoryImage[];
  audio: StoryAudio[];
  tags?: string[];
  isPremium?: boolean;
  isPublished?: boolean;
  estimatedMinutes?: number;
  totalHAYQReward?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Supabase DB shape (flat, for persistence) ────────────────────────────────

export interface StoryProgressRow {
  id: string;
  device_id: string;
  story_id: string;
  current_chapter_index: number;
  current_page_index: number;
  completed_chapter_ids: string[];
  completed_page_ids: string[];
  answered_question_ids: string[];
  total_hayq_earned: number;
  started_at: string;
  last_read_at: string;
  completed_at: string | null;
}

// ─── Helper: compute reading progress percent ─────────────────────────────────

export function computeStoryProgress(story: Story, progress: StoryProgress): number {
  const totalPages = story.chapters.reduce((s, c) => s + c.pages.length, 0);
  if (totalPages === 0) return 0;
  return Math.round((progress.completedPageIds.length / totalPages) * 100);
}
