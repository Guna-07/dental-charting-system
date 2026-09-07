import { UnstyledButton } from "@mantine/core";

interface BleedingToggleProps {
  active: boolean;
  ariaLabel: string;
  color?: string;
  onToggle: () => void;
}

/** A small on/off cell used for BOP, plaque and suppuration. */
export function BleedingToggle({
  active,
  ariaLabel,
  color = "red",
  onToggle,
}: BleedingToggleProps) {
  return (
    <UnstyledButton
      role="checkbox"
      aria-checked={active}
      aria-label={ariaLabel}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
      style={{
        width: 26,
        height: 26,
        borderRadius: 4,
        border: `1px solid var(--mantine-color-gray-4)`,
        background: active
          ? `var(--mantine-color-${color}-6)`
          : "var(--mantine-color-body)",
        color: active ? "#fff" : "var(--mantine-color-gray-5)",
        fontSize: 13,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {active ? "✓" : "·"}
    </UnstyledButton>
  );
}
