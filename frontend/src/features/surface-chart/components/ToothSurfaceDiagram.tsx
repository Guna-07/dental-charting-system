import { useMemo } from "react";

import {
  SURFACE_ABBREV,
  surfaceLabel,
  surfacesForTooth,
  type Surface,
} from "@/constants/dental/surfaces";

import { ToothSurface } from "./ToothSurface";
import type { SurfaceFindingEntry } from "../types/surface-chart.types";

const SIZE = 150;
const A = 48; // inner square inset
const B = SIZE - A;

interface ToothSurfaceDiagramProps {
  toothNumber: string;
  entries: Partial<Record<Surface, SurfaceFindingEntry>>;
  selected: Surface[];
  onToggle: (surface: Surface) => void;
}

/**
 * Five-zone tooth surface diagram (data-driven, one component for every tooth).
 *  top = buccal/labial · bottom = lingual/palatal · left = mesial · right = distal
 *  centre = occlusal (posterior) / incisal (anterior)
 */
export function ToothSurfaceDiagram({
  toothNumber,
  entries,
  selected,
  onToggle,
}: ToothSurfaceDiagramProps) {
  const surfaces = surfacesForTooth(toothNumber);
  const facial = surfaces.includes("buccal") ? "buccal" : "labial";
  const centre = surfaces.includes("occlusal") ? "occlusal" : "incisal";

  const zones = useMemo(
    () =>
      [
        {
          surface: facial as Surface,
          shape: "polygon" as const,
          points: `0,0 ${SIZE},0 ${B},${A} ${A},${A}`,
          labelPos: { x: SIZE / 2, y: A / 2 },
        },
        {
          surface: "lingual" as Surface,
          shape: "polygon" as const,
          points: `0,${SIZE} ${SIZE},${SIZE} ${B},${B} ${A},${B}`,
          labelPos: { x: SIZE / 2, y: SIZE - A / 2 },
        },
        {
          surface: "mesial" as Surface,
          shape: "polygon" as const,
          points: `0,0 ${A},${A} ${A},${B} 0,${SIZE}`,
          labelPos: { x: A / 2, y: SIZE / 2 },
        },
        {
          surface: "distal" as Surface,
          shape: "polygon" as const,
          points: `${SIZE},0 ${B},${A} ${B},${B} ${SIZE},${SIZE}`,
          labelPos: { x: SIZE - A / 2, y: SIZE / 2 },
        },
        {
          surface: centre as Surface,
          shape: "rect" as const,
          rect: { x: A, y: A, w: B - A, h: B - A },
          labelPos: { x: SIZE / 2, y: SIZE / 2 },
        },
      ].filter((z) => surfaces.includes(z.surface)),
    [facial, centre, surfaces],
  );

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="group"
      aria-label={`Tooth ${toothNumber} surfaces`}
    >
      {zones.map((z) => (
        <ToothSurface
          key={z.surface}
          surface={z.surface}
          label={
            z.surface === "mesial" || z.surface === "distal"
              ? SURFACE_ABBREV[z.surface]
              : surfaceLabel(toothNumber, z.surface)
          }
          ariaLabel={surfaceLabel(toothNumber, z.surface)}
          shape={z.shape}
          points={z.points}
          rect={z.rect}
          labelPos={z.labelPos}
          finding={entries[z.surface]?.finding}
          selected={selected.includes(z.surface)}
          onToggle={onToggle}
        />
      ))}
    </svg>
  );
}
