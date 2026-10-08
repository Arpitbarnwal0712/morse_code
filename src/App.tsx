import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Keyboard } from "lucide-react";

import Editor from "./components/Editor";
import HistoryPanel from "./components/HistoryPanel";
import PlaybackPanel from "./components/PlaybackPanel";
import ReferenceTable from "./components/ReferenceTable";
import ShortcutPanel from "./components/ShortcutPanel";
import StatsBar from "./components/StatsBar";
import Visualizer from "./components/Visualizer";

import { useHistory } from "./hooks/useHistory";
import { useMorsePlayer } from "./hooks/useMorsePlayer";

import { REVERSE_MORSE_CODE } from "./data/morse";

import {
  computeStats,
  translate,
  type TranslationMode,
} from "./lib/morse";

import "./App.css";

function App() {
  const [mode, setMode] =
    useState<TranslationMode>("encode");

  const [input, setInput] = useState("");

  const [shortcutsOpen, setShortcutsOpen] =
    useState(false);

  /*
   * Translation
   */
  const result = useMemo(
    () => translate(input, mode),
    [input, mode],
  );

  const output = result.output;

  /*
   * Morse used by audio player
   * and visualizer.
   */
  const morseForPlayback =
    mode === "encode"
      ? output
      : input;

  /*
   * Morse audio player
   */
  const player = useMorsePlayer({
    morse: morseForPlayback,
  });

  /*
   * History
   */
  const {
    history,
    addHistory,
    removeHistory,
    clearHistory,
  } = useHistory();

  /*
   * Translation statistics
   */
  const stats = useMemo(
    () =>
      computeStats(
        mode === "encode"
          ? input
          : output,
        morseForPlayback,
        player.wpm,
      ),
    [
      input,
      output,
      mode,
      morseForPlayback,
      player.wpm,
    ],
  );

  /*
   * Automatically save useful translations
   * to local history after the user pauses
   * typing.
   */
  useEffect(() => {
    if (!input.trim() || !output.trim()) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        addHistory(
          input,
          output,
          mode,
        );
      }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    input,
    output,
    mode,
    addHistory,
  ]);

  /*
   * Clear editor
   */
  const handleClear = () => {
    player.stop();
    setInput("");
  };

  /*
   * Swap translation direction
   */
  const handleSwap = () => {
    player.stop();

    if (!output.trim()) {
      setMode(
        mode === "encode"
          ? "decode"
          : "encode",
      );

      return;
    }

    setInput(output);

    setMode(
      mode === "encode"
        ? "decode"
        : "encode",
    );
  };

  /*
   * Change translation mode
   */
  const handleModeChange = (
    nextMode: TranslationMode,
  ) => {
    if (nextMode === mode) {
      return;
    }

    player.stop();

    /*
     * Carry current output into the
     * input when changing direction.
     */
    if (output.trim()) {
      setInput(output);
    }

    setMode(nextMode);
  };

  /*
   * Copy output
   */
  const handleCopy = async () => {
    if (!output.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        output,
      );
    } catch {
      /*
       * Fallback for browsers where
       * Clipboard API isn't available.
       */
      const textarea =
        document.createElement(
          "textarea",
        );

      textarea.value = output;

      textarea.style.position =
        "fixed";

      textarea.style.opacity = "0";

      document.body.appendChild(
        textarea,
      );

      textarea.select();

      try {
        document.execCommand(
          "copy",
        );
      } finally {
        textarea.remove();
      }
    }
  };

  /*
   * Export output as TXT
   */
  const handleExport = () => {
    if (!output.trim()) {
      return;
    }

    const blob = new Blob(
      [output],
      {
        type: "text/plain;charset=utf-8",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      mode === "encode"
        ? "morse-output.txt"
        : "decoded-text.txt";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };

  /*
   * Reuse history item
   */
  const handleReuse = (
    item: (typeof history)[number],
  ) => {
    player.stop();

    setMode(item.mode);
    setInput(item.input);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * Insert character / Morse symbol
   * from reference table.
   */
  const handleReferenceInsert = (
    morse: string,
  ) => {
    if (mode === "encode") {
      const character =
        REVERSE_MORSE_CODE[morse];

      if (!character) {
        return;
      }

      setInput(
        (current) =>
          current + character,
      );

      return;
    }

    setInput((current) => {
      const separator =
        current.trim()
          ? " "
          : "";

      return (
        current +
        separator +
        morse
      );
    });
  };

  /*
   * Keyboard shortcuts
   *
   * Ctrl/Cmd + Enter
   *   Play / Pause / Resume
   *
   * Ctrl/Cmd + Shift + S
   *   Swap
   *
   * Ctrl/Cmd + Shift + C
   *   Copy
   *
   * Ctrl/Cmd + Shift + E
   *   Export
   *
   * Ctrl/Cmd + Shift + X
   *   Clear
   *
   * Ctrl/Cmd + Shift + M
   *   Change mode
   *
   * Escape
   *   Stop
   *
   * ?
   *   Shortcut panel
   */
  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      const modifier =
        event.ctrlKey ||
        event.metaKey;

      /*
       * Open shortcuts with ?
       */
      if (
        event.key === "?" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();

        setShortcutsOpen(
          (current) => !current,
        );

        return;
      }

      /*
       * Escape
       */
      if (event.key === "Escape") {
        player.stop();
        setShortcutsOpen(false);
        return;
      }

      if (!modifier) {
        return;
      }

      /*
       * Ctrl/Cmd + Enter
       */
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        if (
          player.state === "playing"
        ) {
          player.pause();
        } else if (
          player.state === "paused"
        ) {
          player.resume();
        } else {
          player.play();
        }

        return;
      }

      /*
       * Ctrl/Cmd + Shift + S
       */
      if (
        event.shiftKey &&
        event.key.toLowerCase() === "s"
      ) {
        event.preventDefault();

        handleSwap();

        return;
      }

      /*
       * Ctrl/Cmd + Shift + C
       */
      if (
        event.shiftKey &&
        event.key.toLowerCase() === "c"
      ) {
        event.preventDefault();

        void handleCopy();

        return;
      }

      /*
       * Ctrl/Cmd + Shift + E
       */
      if (
        event.shiftKey &&
        event.key.toLowerCase() === "e"
      ) {
        event.preventDefault();

        handleExport();

        return;
      }

      /*
       * Ctrl/Cmd + Shift + X
       */
      if (
        event.shiftKey &&
        event.key.toLowerCase() === "x"
      ) {
        event.preventDefault();

        handleClear();

        return;
      }

      /*
       * Ctrl/Cmd + Shift + M
       */
      if (
        event.shiftKey &&
        event.key.toLowerCase() === "m"
      ) {
        event.preventDefault();

        handleModeChange(
          mode === "encode"
            ? "decode"
            : "encode",
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    mode,
    player,
  ]);

  return (
    <div className="app-shell">
      {/* =========================================
          HEADER
      ========================================= */}

      <header className="site-header">
        <div className="container header-inner">
          <a
            href="#top"
            className="brand"
            aria-label="Morse Studio Pro home"
          >
            <div className="brand-mark">
              <span>·</span>
              <span>—</span>
            </div>

            <div>
              <strong>
                Morse Studio
              </strong>

              <span>PRO</span>
            </div>
          </a>

          <nav className="header-nav">
            <a href="#studio">
              Studio
            </a>

            <a href="#reference">
              Reference
            </a>

            <a href="#history">
              History
            </a>

            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="github-link"
            >
              GitHub
            </a>

            <button
              type="button"
              className="shortcut-trigger"
              onClick={() =>
                setShortcutsOpen(true)
              }
              aria-label="Open keyboard shortcuts"
              title="Keyboard shortcuts"
            >
              <Keyboard size={16} />
            </button>
          </nav>
        </div>
      </header>

      {/* =========================================
          HERO
      ========================================= */}

      <section
        id="top"
        className="hero"
      >
        <div className="container hero-inner">
          <div className="hero-badge">
            <span className="hero-dot" />

            Developer-grade Morse toolkit
          </div>

          <h1>
            Decode the signal.
            <br />

            <span>
              Master the language.
            </span>
          </h1>

          <p className="hero-description">
            A fast, precise Morse code studio
            for translating text, decoding
            signals, and learning Morse by
            listening.
          </p>

          <div className="hero-pills">
            <span>
              ⚡ Real-time
            </span>

            <span>
              ◉ Audio playback
            </span>

            <span>
              ◈ Offline
            </span>
          </div>
        </div>
      </section>

      {/* =========================================
          MAIN STUDIO
      ========================================= */}

      <main
        id="studio"
        className="studio-section"
      >
        <div className="container">
          {/* EDITOR */}

          <Editor
            mode={mode}
            input={input}
            output={output}
            result={result}
            onInputChange={setInput}
            onModeChange={
              handleModeChange
            }
            onSwap={handleSwap}
            onClear={handleClear}
            onCopy={() => {
              void handleCopy();
            }}
            onExport={handleExport}
          />

          {/* STATS */}

          <StatsBar
            stats={stats}
          />

          {/* PLAYBACK */}

          <PlaybackPanel
            state={player.state}
            wpm={player.wpm}
            frequency={
              player.frequency
            }
            volume={player.volume}
            progress={
              player.progress
            }
            onWpmChange={
              player.setWpm
            }
            onFrequencyChange={
              player.setFrequency
            }
            onVolumeChange={
              player.setVolume
            }
            onPlay={player.play}
            onPause={player.pause}
            onResume={
              player.resume
            }
            onStop={player.stop}
          />

          {/* VISUALIZER */}

          <Visualizer
            morse={
              morseForPlayback
            }
            activeTone={
              player.activeTone
            }
            sounding={
              player.sounding
            }
          />

          {/* HISTORY */}

          <div
            id="history"
            className="section-anchor"
          />

          <HistoryPanel
            history={history}
            onReuse={handleReuse}
            onDelete={
              removeHistory
            }
            onClear={
              clearHistory
            }
          />

          {/* REFERENCE */}

          <div
            id="reference"
            className="section-anchor"
          />

          <ReferenceTable
            onInsert={
              handleReferenceInsert
            }
          />
        </div>
      </main>

      {/* =========================================
          FOOTER
      ========================================= */}

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <strong>
              Morse Studio Pro
            </strong>

            <span>
              Built for learning,
              decoding & communication.
            </span>
          </div>

          <div className="footer-right">
            <span>
              Made by Arpit Barnwal
            </span>
          </div>
        </div>
      </footer>

      {/* =========================================
          KEYBOARD SHORTCUT PANEL
      ========================================= */}

      <ShortcutPanel
        open={shortcutsOpen}
        onClose={() =>
          setShortcutsOpen(false)
        }
      />
    </div>
  );
}

export default App;