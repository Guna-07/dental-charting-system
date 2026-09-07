import type { Surface } from "@/constants/dental/surfaces";
import { surfaceFinding, type SurfaceFindingType } from "@/constants/dental/findings";

interface ToothSurfaceProps {
  surface: Surface;
  label: string;
  ariaLabel: string;
  shape: "polygon" | "rect";
  points?: string;
  rect?: { x: number; y: number; w: number; h: number };
  labelPos: { x: number; y: number };
  finding?: SurfaceFindingType;
  selected: boolean;
  onToggle: (surface: Surface) => void;
}

export function ToothSurface({
  surface,
  label,
  ariaLabel,
  shape,
  points,
  rect,
  labelPos,
  finding,
  selected,
  onToggle,
}: ToothSurfaceProps) {
  const meta = finding ? surfaceFinding(finding) : null;
  const fill = meta
    ? `var(--mantine-color-${meta.color}-3)`
    : "var(--mantine-color-gray-0)";
  const stroke = selected
    ? "var(--mantine-color-teal-7)"
    : "var(--mantine-color-gray-5)";

  const common = {
    fill,
    stroke,
    strokeWidth: selected ? 3 : 1,
    style: { cursor: "pointer" as const },
    onClick: () => onToggle(surface),
    role: "button" as const,
    tabIndex: 0,
    "aria-pressed": selected,
    "aria-label": `${ariaLabel}${finding ? `: ${meta?.label}` : ""}`,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle(surface);
      }
    },
  };

  return (
    <g>
      {shape === "polygon" ? (
        <polygon points={points} {...common} />
      ) : (
        <rect x={rect!.x} y={rect!.y} width={rect!.w} height={rect!.h} {...common} />
      )}
      <text
        x={labelPos.x}
        y={labelPos.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        fill="var(--mantine-color-gray-7)"
        pointerEvents="none"
      >
        {label}
      </text>
    </g>
  );
}
