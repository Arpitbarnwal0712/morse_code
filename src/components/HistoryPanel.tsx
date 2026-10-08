// src/components/HistoryPanel.tsx

import {
  Clock3,
  History,
  RotateCcw,
  Trash2,
} from "lucide-react";

import type { HistoryItem } from "../hooks/useHistory";

interface HistoryPanelProps {
  history: HistoryItem[];

  onReuse: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export default function HistoryPanel({
  history,
  onReuse,
  onDelete,
  onClear,
}: HistoryPanelProps) {
  return (
    <section
      className="history-section"
      aria-labelledby="history-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <History size={14} />
            Local storage
          </span>

          <h3 id="history-title">
            Recent translations
          </h3>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            className="text-button danger"
            onClick={onClear}
            aria-label="Clear all history"
          >
            <Trash2 size={15} />
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <div className="empty-icon">
            <History size={22} />
          </div>

          <strong>No translations yet</strong>

          <span>
            Your recent conversions will appear here.
          </span>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <article
              className="history-item"
              key={item.id}
            >
              <div className="history-content">
                <div className="history-meta">
                  <span className="history-mode">
                    {item.mode === "encode"
                      ? "Text → Morse"
                      : "Morse → Text"}
                  </span>

                  <span className="history-time">
                    <Clock3 size={13} />
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <div className="history-input">
                  {item.input}
                </div>

                <div className="history-output">
                  {item.output}
                </div>
              </div>

              <div className="history-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onReuse(item)}
                  aria-label={`Reuse: ${item.input.slice(
                    0,
                    40,
                  )}`}
                  title="Reuse"
                >
                  <RotateCcw size={15} />
                  Reuse
                </button>

                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() =>
                    onDelete(item.id)
                  }
                  aria-label={`Delete: ${item.input.slice(
                    0,
                    40,
                  )}`}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}