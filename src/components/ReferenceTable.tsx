// src/components/ReferenceTable.tsx

import {
  BookOpen,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { MORSE_REFERENCE } from "../data/morse";

interface ReferenceTableProps {
  onInsert?: (morse: string) => void;
}

export default function ReferenceTable({
  onInsert,
}: ReferenceTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return MORSE_REFERENCE;
    }

    return MORSE_REFERENCE.filter(
      ({ character, morse }) =>
        character
          .toLowerCase()
          .includes(query) ||
        morse.includes(query),
    );
  }, [search]);

  return (
    <section
      className="reference-section"
      aria-labelledby="reference-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <BookOpen size={14} />
            Quick reference
          </span>

          <h3 id="reference-title">
            Morse code reference
          </h3>
        </div>
      </div>

      <div className="reference-search">
        <Search size={17} />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search A, Z, 1, .-, ..."
          aria-label="Search Morse reference"
        />
      </div>

      <div
        className="reference-grid"
        aria-live="polite"
      >
        {filtered.map(
          ({ character, morse }) => (
            <button
              type="button"
              className="reference-item"
              key={character}
              onClick={() =>
                onInsert?.(morse)
              }
              title={`Insert ${character}: ${morse}`}
            >
              <span className="reference-character">
                {character}
              </span>

              <span className="reference-morse">
                {morse}
              </span>
            </button>
          ),
        )}

        {filtered.length === 0 && (
          <div className="reference-empty">
            No Morse symbols found.
          </div>
        )}
      </div>
    </section>
  );
}