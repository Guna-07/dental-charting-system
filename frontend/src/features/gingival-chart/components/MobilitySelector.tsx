import { MOBILITY_OPTIONS } from "@/constants/dental/periodontal";

interface MobilitySelectorProps {
  value: number | null;
  ariaLabel: string;
  onChange: (value: number | null) => void;
}

/** Compact 0–3 selector, reused for mobility and furcation grading. */
export function MobilitySelector({
  value,
  ariaLabel,
  onChange,
}: MobilitySelectorProps) {
  return (
    <select
      aria-label={ariaLabel}
      value={value === null ? "" : String(value)}
      onChange={(e) =>
        onChange(e.currentTarget.value === "" ? null : Number(e.currentTarget.value))
      }
      style={{
        width: 40,
        height: 26,
        borderRadius: 4,
        border: "1px solid var(--mantine-color-gray-4)",
        fontSize: 12,
        background: "var(--mantine-color-body)",
        color: "inherit",
      }}
    >
      <option value="">–</option>
      {MOBILITY_OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
