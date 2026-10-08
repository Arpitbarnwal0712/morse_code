// src/components/PlaybackPanel.tsx

import {
  Pause,
  Play,
  Square,
  Volume2,
  Waves,
  Zap,
} from "lucide-react";

import type { PlayerState } from "../hooks/useMorsePlayer";

interface PlaybackPanelProps {
  state: PlayerState;

  wpm: number;
  frequency: number;
  volume: number;

  progress: number;

  onWpmChange: (value: number) => void;
  onFrequencyChange: (value: number) => void;
  onVolumeChange: (value: number) => void;

  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function PlaybackPanel({
  state,
  wpm,
  frequency,
  volume,
  progress,
  onWpmChange,
  onFrequencyChange,
  onVolumeChange,
  onPlay,
  onPause,
  onResume,
  onStop,
}: PlaybackPanelProps) {
  const isPlaying = state === "playing";
  const isPaused = state === "paused";

  return (
    <section className="playback-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <Waves size={14} />
            Audio
          </span>

          <h3>Morse playback</h3>
        </div>

        <span
          className={`player-status ${state}`}
        >
          <span className="status-dot" />
          {state === "idle" && "Ready"}
          {state === "playing" && "Playing"}
          {state === "paused" && "Paused"}
          {state === "stopped" && "Stopped"}
        </span>
      </div>

      {/* Controls */}
      <div className="playback-controls">
        <button
          type="button"
          className="play-button"
          onClick={
            isPlaying
              ? onPause
              : isPaused
                ? onResume
                : onPlay
          }
          aria-label={
            isPlaying
              ? "Pause playback"
              : isPaused
                ? "Resume playback"
                : "Play Morse audio"
          }
        >
          {isPlaying ? (
            <Pause size={19} />
          ) : (
            <Play size={19} />
          )}

          {isPlaying
            ? "Pause"
            : isPaused
              ? "Resume"
              : "Play"}
        </button>

        <button
          type="button"
          className="stop-button"
          onClick={onStop}
          disabled={
            state === "idle" ||
            state === "stopped"
          }
          aria-label="Stop playback"
        >
          <Square size={16} />
          Stop
        </button>
      </div>

      {/* Progress */}
      <div className="progress-container">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <span>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Sliders */}
      <div className="audio-settings">
        {/* WPM */}
        <label className="range-control">
          <div className="range-header">
            <span>
              <Zap size={15} />
              Speed
            </span>

            <strong>{wpm} WPM</strong>
          </div>

          <input
            type="range"
            min="5"
            max="40"
            step="1"
            value={wpm}
            onChange={(event) =>
              onWpmChange(
                Number(event.target.value),
              )
            }
            aria-label="Playback speed in words per minute"
          />

          <div className="range-labels">
            <span>5</span>
            <span>40</span>
          </div>
        </label>

        {/* Frequency */}
        <label className="range-control">
          <div className="range-header">
            <span>
              <Waves size={15} />
              Tone
            </span>

            <strong>{frequency} Hz</strong>
          </div>

          <input
            type="range"
            min="300"
            max="1200"
            step="10"
            value={frequency}
            onChange={(event) =>
              onFrequencyChange(
                Number(event.target.value),
              )
            }
            aria-label="Tone frequency"
          />

          <div className="range-labels">
            <span>300 Hz</span>
            <span>1200 Hz</span>
          </div>
        </label>

        {/* Volume */}
        <label className="range-control">
          <div className="range-header">
            <span>
              <Volume2 size={15} />
              Volume
            </span>

            <strong>
              {Math.round(volume * 100)}%
            </strong>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) =>
              onVolumeChange(
                Number(event.target.value),
              )
            }
            aria-label="Playback volume"
          />

          <div className="range-labels">
            <span>0%</span>
            <span>100%</span>
          </div>
        </label>
      </div>
    </section>
  );
}