import {
  Keyboard,
  X,
} from "lucide-react";

interface ShortcutPanelProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    keys: ["Ctrl", "Enter"],
    label: "Play / Pause / Resume",
  },
  {
    keys: ["Ctrl", "Shift", "S"],
    label: "Swap direction",
  },
  {
    keys: ["Ctrl", "Shift", "C"],
    label: "Copy output",
  },
  {
    keys: ["Ctrl", "Shift", "E"],
    label: "Export translation",
  },
  {
    keys: ["Ctrl", "Shift", "X"],
    label: "Clear editor",
  },
  {
    keys: ["Ctrl", "Shift", "M"],
    label: "Change mode",
  },
  {
    keys: ["Esc"],
    label: "Stop playback",
  },
];

export default function ShortcutPanel({
  open,
  onClose,
}: ShortcutPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="shortcut-overlay"
      onMouseDown={onClose}
    >
      <div
        className="shortcut-panel"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-title"
      >
        <div className="shortcut-header">
          <div>
            <span className="eyebrow">
              <Keyboard size={14} />
              Keyboard
            </span>

            <h3 id="shortcut-title">
              Keyboard Shortcuts
            </h3>
          </div>

          <button
            type="button"
            className="shortcut-close"
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
          >
            <X size={17} />
          </button>
        </div>

        <div className="shortcut-list">
          {shortcuts.map((shortcut) => (
            <div
              className="shortcut-row"
              key={shortcut.label}
            >
              <span>
                {shortcut.label}
              </span>

              <div className="shortcut-keys">
                {shortcut.keys.map(
                  (key) => (
                    <kbd key={key}>
                      {key}
                    </kbd>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcut-footer">
          <Keyboard size={14} />

          <span>
            On macOS, use ⌘ instead of Ctrl.
          </span>
        </div>
      </div>
    </div>
  );
}