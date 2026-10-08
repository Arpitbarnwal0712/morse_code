// src/components/StatsBar.tsx

import {
  BarChart3,
  Circle,
  Clock3,
  Hash,
  Minus,
  Type,
} from "lucide-react";

import {
  formatDuration,
  type MorseStats,
} from "../lib/morse";

interface StatsBarProps {
  stats: MorseStats;
}

export default function StatsBar({
  stats,
}: StatsBarProps) {
  const items = [
    {
      label: "Characters",
      value: stats.characters,
      icon: Type,
    },
    {
      label: "Words",
      value: stats.words,
      icon: Hash,
    },
    {
      label: "Dots",
      value: stats.dots,
      icon: Circle,
    },
    {
      label: "Dashes",
      value: stats.dashes,
      icon: Minus,
    },
    {
      label: "Symbols",
      value: stats.symbols,
      icon: BarChart3,
    },
    {
      label: "Est. Time",
      value: formatDuration(
        stats.estimatedSeconds,
      ),
      icon: Clock3,
    },
  ];

  return (
    <section className="stats-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <BarChart3 size={14} />
            Analytics
          </span>

          <h3>Translation stats</h3>
        </div>
      </div>

      <div className="stats-grid">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              className="stat-card"
              key={item.label}
            >
              <div className="stat-icon">
                <Icon size={17} />
              </div>

              <div>
                <span className="stat-label">
                  {item.label}
                </span>

                <strong className="stat-value">
                  {item.value}
                </strong>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}