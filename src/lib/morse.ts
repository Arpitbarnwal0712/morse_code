// src/lib/morse.ts

import {
  MORSE_CODE,
  REVERSE_MORSE_CODE,
} from "../data/morse";

export type TranslationMode = "encode" | "decode";

export interface TranslationIssue {
  token: string;
  message: string;
}

export interface TranslationResult {
  output: string;
  issues: TranslationIssue[];
}

export interface MorseStats {
  characters: number;
  words: number;
  dots: number;
  dashes: number;
  symbols: number;
  estimatedSeconds: number;
}

/**
 * Convert normal English text into Morse code.
 */
export function encode(text: string): TranslationResult {
  if (!text.trim()) {
    return {
      output: "",
      issues: [],
    };
  }

  const issues: TranslationIssue[] = [];

  const lines = text.toUpperCase().split("\n");

  const encodedLines = lines.map((line) => {
    const words = line.trim().split(/\s+/).filter(Boolean);

    return words
      .map((word) => {
        const encodedCharacters = [...word].map((character) => {
          const morse = MORSE_CODE[character];

          if (!morse) {
            issues.push({
              token: character,
              message: `Unsupported character: ${character}`,
            });

            return "";
          }

          return morse;
        });

        return encodedCharacters.filter(Boolean).join(" ");
      })
      .filter(Boolean)
      .join(" / ");
  });

  return {
    output: encodedLines.join("\n"),
    issues,
  };
}

/**
 * Convert Morse code into normal text.
 *
 * Supported word separators:
 * - /
 * - 3 or more spaces
 */
export function decode(morse: string): TranslationResult {
  if (!morse.trim()) {
    return {
      output: "",
      issues: [],
    };
  }

  const issues: TranslationIssue[] = [];

  const normalised = morse
    .replaceAll("•", ".")
    .replaceAll("—", "-")
    .replaceAll("–", "-")
    .replaceAll("_", "-")
    .replace(/\s*\|\s*/g, " / ");

  const lines = normalised.split("\n");

  const decodedLines = lines.map((line) => {
    const wordGroups = line
      .trim()
      .split(/\s*(?:\/|\s{3,})\s*/)
      .filter(Boolean);

    return wordGroups
      .map((word) => {
        const symbols = word.split(/\s+/).filter(Boolean);

        return symbols
          .map((symbol) => {
            const character = REVERSE_MORSE_CODE[symbol];

            if (!character) {
              issues.push({
                token: symbol,
                message: `Unknown Morse sequence: ${symbol}`,
              });

              return "�";
            }

            return character;
          })
          .join("");
      })
      .join(" ");
  });

  return {
    output: decodedLines.join("\n"),
    issues,
  };
}

/**
 * Generic translator.
 */
export function translate(
  value: string,
  mode: TranslationMode,
): TranslationResult {
  return mode === "encode"
    ? encode(value)
    : decode(value);
}

/**
 * Detect whether the input looks like Morse code.
 */
export function looksLikeMorse(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  // Plain text containing only dots/dashes/spaces/slashes
  // is most likely Morse.
  if (!/^[.\-_\s/|•—–]+$/.test(trimmed)) {
    return false;
  }

  return /[.-]/.test(trimmed);
}

/**
 * Build playback timing information.
 *
 * ITU timing:
 * dot       = 1 unit
 * dash      = 3 units
 * symbol gap = 1 unit
 * letter gap = 3 units
 * word gap   = 7 units
 */
export interface TimelineEvent {
  type: "tone" | "gap";
  tone: "." | "-" | null;
  start: number;
  duration: number;
  toneIndex: number;
}

export interface MorseTimeline {
  events: TimelineEvent[];
  totalUnits: number;
}

export function buildTimeline(morse: string): MorseTimeline {
  const events: TimelineEvent[] = [];

  let currentUnit = 0;
  let toneIndex = 0;

  const lines = morse.split("\n");

  lines.forEach((line, lineIndex) => {
    const words = line.split(/\s*\/\s*/);

    words.forEach((word, wordIndex) => {
      const letters = word.trim().split(/\s{1,}/).filter(Boolean);

      letters.forEach((letter, letterIndex) => {
        [...letter].forEach((symbol, symbolIndex) => {
          if (symbol !== "." && symbol !== "-") {
            return;
          }

          const duration = symbol === "." ? 1 : 3;

          events.push({
            type: "tone",
            tone: symbol,
            start: currentUnit,
            duration,
            toneIndex,
          });

          currentUnit += duration;
          toneIndex++;

          if (symbolIndex < letter.length - 1) {
            events.push({
              type: "gap",
              tone: null,
              start: currentUnit,
              duration: 1,
              toneIndex: -1,
            });

            currentUnit += 1;
          }
        });

        if (letterIndex < letters.length - 1) {
          events.push({
            type: "gap",
            tone: null,
            start: currentUnit,
            duration: 3,
            toneIndex: -1,
          });

          currentUnit += 3;
        }
      });

      if (wordIndex < words.length - 1) {
        events.push({
          type: "gap",
          tone: null,
          start: currentUnit,
          duration: 7,
          toneIndex: -1,
        });

        currentUnit += 7;
      }
    });

    if (lineIndex < lines.length - 1) {
      events.push({
        type: "gap",
        tone: null,
        start: currentUnit,
        duration: 7,
        toneIndex: -1,
      });

      currentUnit += 7;
    }
  });

  return {
    events,
    totalUnits: currentUnit,
  };
}

/**
 * Calculate useful statistics for the current translation.
 */
export function computeStats(
  text: string,
  morse: string,
  wpm = 20,
): MorseStats {
  const characters = text.replace(/\s/g, "").length;

  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  const dots = (morse.match(/\./g) ?? []).length;
  const dashes = (morse.match(/-/g) ?? []).length;

  const symbols = dots + dashes;

  const timeline = buildTimeline(morse);

  // PARIS standard: 50 units per "PARIS"
  const secondsPerUnit = 1.2 / Math.max(wpm, 1);

  const estimatedSeconds =
    timeline.totalUnits * secondsPerUnit;

  return {
    characters,
    words,
    dots,
    dashes,
    symbols,
    estimatedSeconds,
  };
}

/**
 * Format seconds into a human-readable duration.
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0s";
  }

  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}m ${remainingSeconds}s`;
}