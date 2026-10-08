import {
  ArrowLeftRight,
  Clipboard,
  Download,
  Eraser,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";

import {
  looksLikeMorse,
  type TranslationMode,
  type TranslationResult,
} from "../lib/morse";

interface EditorProps {
  mode: TranslationMode;
  input: string;
  output: string;
  result: TranslationResult;

  onInputChange: (value: string) => void;
  onModeChange: (mode: TranslationMode) => void;

  onSwap: () => void;
  onClear: () => void;
  onCopy: () => void;
  onExport: () => void;
}

export default function Editor({
  mode,
  input,
  output,
  result,
  onInputChange,
  onModeChange,
  onSwap,
  onClear,
  onCopy,
  onExport,
}: EditorProps) {
  const isEncode = mode === "encode";

  const mismatch = useMemo(() => {
    if (!input.trim()) {
      return false;
    }

    if (isEncode) {
      return looksLikeMorse(input);
    }

    return /[a-z0-9]/i.test(input);
  }, [input, isEncode]);

  const placeholder = isEncode
    ? "Type something here..."
    : ".... . .-.. .-.. --- / .-- --- .-. .-.. -..";

  const inputLabel = isEncode
    ? "Plain Text"
    : "Morse Code";

  const outputLabel = isEncode
    ? "Morse Code"
    : "Plain Text";

  return (
    <section className="editor-section">
      {/* Header */}
      <div className="editor-header">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} />
            Translator
          </div>

          <h2>Morse Code Studio</h2>

          <p>
            Convert text and Morse code instantly.
          </p>
        </div>

        <div className="mode-switch">
          <button
            type="button"
            className={
              isEncode
                ? "mode-button active"
                : "mode-button"
            }
            onClick={() =>
              onModeChange("encode")
            }
          >
            Text → Morse
          </button>

          <button
            type="button"
            className={
              !isEncode
                ? "mode-button active"
                : "mode-button"
            }
            onClick={() =>
              onModeChange("decode")
            }
          >
            Morse → Text
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="editor-grid">
        {/* Input */}
        <div className="editor-card">
          <div className="editor-card-header">
            <span>{inputLabel}</span>

            <span className="character-count">
              {input.length} chars
            </span>
          </div>

          <textarea
            id="studio-input"
            value={input}
            onChange={(event) =>
              onInputChange(event.target.value)
            }
            placeholder={placeholder}
            spellCheck={isEncode}
            autoComplete="off"
            className="editor-textarea"
          />

          <div className="editor-toolbar">
            <button
              type="button"
              className="icon-button"
              onClick={onClear}
              title="Clear"
              aria-label="Clear input"
            >
              <Eraser size={17} />
              Clear
            </button>

            <button
              type="button"
              className="icon-button"
              onClick={onSwap}
              title="Swap direction"
              aria-label="Swap translation direction"
            >
              <ArrowLeftRight size={17} />
              Swap
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="editor-card output-card">
          <div className="editor-card-header">
            <span>{outputLabel}</span>

            <span className="output-status">
              Live
              <span className="status-dot" />
            </span>
          </div>

          <div
            className={
              output
                ? "editor-output has-output"
                : "editor-output"
            }
          >
            {output || (
              <span className="output-placeholder">
                Your translation will appear here...
              </span>
            )}
          </div>

          <div className="editor-toolbar output-toolbar">
            <button
              type="button"
              className="icon-button"
              onClick={onCopy}
              disabled={!output}
              title="Copy output"
              aria-label="Copy output"
            >
              <Clipboard size={17} />
              Copy
            </button>

            <button
              type="button"
              className="icon-button"
              onClick={onExport}
              disabled={!output}
              title="Export translation"
              aria-label="Export translation as text file"
            >
              <Download size={17} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Wrong-direction hint */}
      {mismatch && (
        <div className="mismatch-alert">
          <div className="mismatch-icon">
            <Lightbulb size={18} />
          </div>

          <div className="mismatch-content">
            <strong>
              This looks like{" "}
              {isEncode
                ? "Morse code"
                : "plain text"}
              .
            </strong>

            <span>
              You may be using the wrong translation
              direction.
            </span>
          </div>

          <button
            type="button"
            className="mismatch-action"
            onClick={() =>
              onModeChange(
                isEncode ? "decode" : "encode",
              )
            }
          >
            Switch direction
            <RefreshCw size={15} />
          </button>
        </div>
      )}

      {/* Translation issues */}
      {result.issues.length > 0 && (
        <div className="translation-warning">
          <strong>
            {result.issues.length} unsupported
            {result.issues.length === 1
              ? " character"
              : " characters"}
          </strong>

          <span>
            Some characters could not be translated.
          </span>

          <div className="issue-list">
            {result.issues
              .slice(0, 8)
              .map((issue, index) => (
                <span
                  key={`${issue.token}-${index}`}
                  className="issue-chip"
                  title={issue.message}
                >
                  {issue.token}
                </span>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}