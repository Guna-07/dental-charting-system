import { MobilitySelector } from "./MobilitySelector";

interface FurcationSelectorProps {
  value: number | null;
  ariaLabel: string;
  disabled?: boolean;
  onChange: (value: number | null) => void;
}

/** Furcation grade 0–3 (Glickman). Disabled for single-rooted teeth. */
export function FurcationSelector({
  value,
  ariaLabel,
  disabled,
  onChange,
}: FurcationSelectorProps) {
  if (disabled) {
    return (
      <span
        aria-label={`${ariaLabel}: not applicable`}
        style={{ color: "var(--mantine-color-gray-4)", fontSize: 12 }}
      >
        n/a
      </span>
    );
  }
  return (
    <MobilitySelector value={value} ariaLabel={ariaLabel} onChange={onChange} />
  );
}
