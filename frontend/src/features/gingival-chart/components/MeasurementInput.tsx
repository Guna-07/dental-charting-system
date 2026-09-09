import { useEffect, useState } from "react";

interface MeasurementInputProps {
  value: number | null;
  min: number;
  max: number;
  ariaLabel: string;
  onChange: (value: number | null) => void;
}

/**
 * Compact numeric-only cell for the periodontal grid.
 *  - only digits are accepted (plus a leading "-" when the range allows it);
 *    letters and symbols are dropped as you type or paste
 *  - ArrowUp / ArrowDown step within range (perio-software convention)
 *  - empty clears the value; out-of-range input is clamped on blur
 */
export function MeasurementInput({
  value,
  min,
  max,
  ariaLabel,
  onChange,
}: MeasurementInputProps) {
  const [text, setText] = useState(value === null ? "" : String(value));
  const allowNegative = min < 0;
  const maxLen = Math.max(String(min).length, String(max).length);

  useEffect(() => {
    setText(value === null ? "" : String(value));
  }, [value]);

  const sanitize = (raw: string): string => {
    let s = raw.replace(/[^\d-]/g, "");
    const negative = allowNegative && s.startsWith("-");
    s = s.replace(/-/g, "");
    return (negative ? "-" : "") + s.slice(0, maxLen);
  };

  const commit = (raw: string) => {
    if (raw === "" || raw === "-") {
      onChange(null);
      return;
    }
    const n = Number(raw);
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
      title={`Allowed: ${min} to ${max}`}
      inputMode="numeric"
      autoComplete="off"
      value={text}
      onChange={(e) => setText(sanitize(e.currentTarget.value))}
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
