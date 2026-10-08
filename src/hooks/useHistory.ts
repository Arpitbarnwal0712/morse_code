// src/hooks/useHistory.ts

import { useCallback, useEffect, useState } from "react";

export interface HistoryItem {
  id: string;
  input: string;
  output: string;
  mode: "encode" | "decode";
  createdAt: number;
}

const STORAGE_KEY = "morse-studio-history";
const MAX_HISTORY = 20;

function loadHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load saved history once.
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Persist history whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(history),
      );
    } catch {
      // localStorage may be unavailable in private/restricted
      // browser environments. The app should still work.
    }
  }, [history]);

  const addHistory = useCallback(
    (
      input: string,
      output: string,
      mode: "encode" | "decode",
    ) => {
      if (!input.trim() || !output.trim()) {
        return;
      }

      const item: HistoryItem = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,
        input,
        output,
        mode,
        createdAt: Date.now(),
      };

      setHistory((current) => {
        // Remove an identical previous entry.
        const filtered = current.filter(
          (entry) =>
            !(
              entry.input === input &&
              entry.output === output &&
              entry.mode === mode
            ),
        );

        return [item, ...filtered].slice(
          0,
          MAX_HISTORY,
        );
      });
    },
    [],
  );

  const removeHistory = useCallback((id: string) => {
    setHistory((current) =>
      current.filter((item) => item.id !== id),
    );
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
  };
}