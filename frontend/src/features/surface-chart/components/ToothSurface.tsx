import { useComputedColorScheme, useMantineTheme } from "@mantine/core";

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
  const theme = useMantineTheme();
  const dark =
    useComputedColorScheme("light", { getInitialValueInEffect: true }) === "dark";
  const palette = (name: string) => theme.colors[name] ?? theme.colors.gray;

  // Concrete hex (not `var(--mantine-color-*)`) so the SVG survives html-to-image
  // export — CSS variables in SVG fill/stroke fall back to black otherwise.
  const fill = selected
    ? palette("teal")[1]
    : meta
      ? palette(meta.color)[1]
      : dark
        ? theme.colors.dark[7]
        : theme.white;

  const labelColor = selected
    ? palette("teal")[dark ? 3 : 8]
    : dark
      ? theme.colors.dark[2]
      : theme.colors.gray[6];

  const common = {
    fill,
    stroke: "none",
    // outline:none removes the browser's default black focus rectangle that
    // otherwise boxes the whole SVG shape after a click.
    style: { cursor: "pointer" as const, outline: "none" },
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
        fontWeight={selected ? 700 : 600}
        fill={labelColor}
        pointerEvents="none"
      >
        {label}
      </text>
    </g>
  );
}
