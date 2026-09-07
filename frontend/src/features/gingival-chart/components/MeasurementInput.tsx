import { useEffect, useState } from "react";

interface MeasurementInputProps {
  value: number | null;
  min: number;
  max: number;
  ariaLabel: string;
  onChange: (value: number | null) => void;
}

/**
 * Compact numeric cell for the periodontal grid.
 *  - ArrowUp / ArrowDown increments / decrements within range (perio-software convention)
 *  - empty string clears the value
 *  - out-of-range input is clamped on blur
 */
export function MeasurementInput({
  value,
  min,
  max,
  ariaLabel,
  onChange,
}: MeasurementInputProps) {
  const [text, setText] = useState(value === null ? "" : String(value));

  useEffect(() => {
    setText(value === null ? "" : String(value));
  }, [value]);

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed === "-") {
      onChange(null);
      return;
    }
    const n = Number(trimmed);
    if (Number.isNaN(n)) {
      setText(value === null ? "" : String(value));
      return;
    }
    onChange(Math.min(max, Math.max(min, Math.round(n))));
  };

  const step = (delta: number) => {
    const current = value ?? (delta > 0 ? min - 1 : max + 1);
    onChange(Math.min(max, Math.max(min, current + delta)));
  };

  return (
    <input
      aria-label={ariaLabel}
      inputMode="numeric"
      value={text}
      onChange={(e) => setText(e.currentTarget.value)}
      onBlur={(e) => commit(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          step(1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          step(-1);
        } else if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      style={{
        width: 32,
        height: 26,
        textAlign: "center",
        border: "1px solid var(--mantine-color-gray-4)",
        borderRadius: 4,
        fontSize: 12,
        background: "var(--mantine-color-body)",
        color: "inherit",
      }}
    />
  );
}
