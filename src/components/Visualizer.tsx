// src/components/Visualizer.tsx

import { Activity, Circle, Minus } from "lucide-react";

interface VisualizerProps {
  morse: string;
  activeTone: number;
  sounding: boolean;
}

export default function Visualizer({
  morse,
  activeTone,
  sounding,
}: VisualizerProps) {
  const tokens = morse
    .split("")
    .filter(
      (character) =>
        character === "." || character === "-",
    );

  return (
    <section className="visualizer-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <Activity size={14} />
            Signal
          </span>

          <h3>Live Morse visualizer</h3>
        </div>

        <span className="visualizer-live">
          <span className="status-dot" />
          Live
        </span>
      </div>

      <div
        className="visualizer"
        aria-label="Morse signal visualizer"
      >
        {tokens.length === 0 ? (
          <div className="visualizer-empty">
            Enter some text to visualize the signal.
          </div>
        ) : (
          tokens.map((token, index) => {
            const active =
              sounding && index === activeTone;

            const past =
              index < activeTone ||
              (!sounding && index === activeTone);

            const className = [
              "signal-token",
              token === "."
                ? "dot-token"
                : "dash-token",
              active ? "active" : "",
              past ? "played" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <span
                key={`${token}-${index}`}
                className={className}
              >
                {token === "." ? (
                  <Circle size={8} fill="currentColor" />
                ) : (
                  <Minus size={18} />
                )}
              </span>
            );
          })
        )}
      </div>
    </section>
  );
}