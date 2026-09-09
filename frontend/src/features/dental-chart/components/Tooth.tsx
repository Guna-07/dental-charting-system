import { useState } from "react";
import { Tooltip, useComputedColorScheme, useMantineTheme } from "@mantine/core";

import {
  investigationFinding,
  type InvestigationFindingType,
} from "@/constants/dental/findings";

import type { ToothFinding } from "../types/dental-chart.types";

interface ToothProps {
  toothNumber: string;
  findings: ToothFinding[];
  selected: boolean;
  onSelect: (toothNumber: string) => void;
}

const W = 34;
const CROWN_H = 30;
const ROOT_H = 16;

/**
 * A single data-driven tooth glyph with all six visual states.
 *
 * Colours are resolved to concrete hex here (not `var(--mantine-color-*)`) so the
 * SVG survives `html-to-image` export — CSS variables in SVG fill/stroke
 * attributes are not resolved by the serializer and fall back to black.
 */
export function Tooth({ toothNumber, findings, selected, onSelect }: ToothProps) {
  const [hovered, setHovered] = useState(false);
  const theme = useMantineTheme();
  const dark =
    useComputedColorScheme("light", { getInitialValueInEffect: true }) === "dark";

  const palette = (name: string) => theme.colors[name] ?? theme.colors.gray;

  const primary = findings[0];
  const isMissing = findings.some(
    (f) => f.type === ("missing" as InvestigationFindingType),
  );
  const meta = primary ? investigationFinding(primary.type) : null;
  const hasFinding = findings.length > 0;

  const bodyBg = dark ? theme.colors.dark[7] : theme.white;
  const neutral = dark ? theme.colors.dark[3] : theme.colors.gray[5];
  const faint = dark ? theme.colors.dark[4] : theme.colors.gray[3];
  const rootBg = dark ? theme.colors.dark[6] : theme.colors.gray[1];
  const xMark = dark ? theme.colors.dark[2] : theme.colors.gray[6];

  const stroke = selected
    ? theme.colors.teal[6]
    : hovered
      ? theme.colors.teal[4]
      : neutral;
  const strokeWidth = selected ? 2.5 : 1.4;
  const fill =
    hasFinding && meta && !isMissing ? palette(meta.color)[1] : bodyBg;

  const label =
    findings.length === 0
      ? `Tooth ${toothNumber}, no findings`
      : `Tooth ${toothNumber}: ${findings
          .map((f) => investigationFinding(f.type).label)
          .join(", ")}`;

  return (
    <Tooltip label={label} withArrow openDelay={200}>
      <svg
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={selected}
        width={W}
        height={CROWN_H + ROOT_H}
        viewBox={`0 0 ${W} ${CROWN_H + ROOT_H}`}
        style={{ cursor: "pointer", display: "block" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSelect(toothNumber)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(toothNumber);
          }
        }}
      >
        {/* root */}
        <path
          d={`M7 ${CROWN_H} L4 ${CROWN_H + ROOT_H} L${W - 4} ${CROWN_H + ROOT_H} L${W - 7} ${CROWN_H} Z`}
          fill={rootBg}
          stroke={stroke}
          strokeWidth={1}
        />
        {/* crown */}
        <rect
          x={2}
          y={2}
          width={W - 4}
          height={CROWN_H - 2}
          rx={6}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={isMissing ? "3 2" : undefined}
        />
        {/* subtle 5-zone cross */}
        <path
          d={`M2 ${CROWN_H / 2 + 1} H${W - 2} M${W / 2} 2 V${CROWN_H}`}
          stroke={faint}
          strokeWidth={0.75}
        />

        {isMissing ? (
          <path
            d={`M8 8 L${W - 8} ${CROWN_H - 6} M${W - 8} 8 L8 ${CROWN_H - 6}`}
            stroke={xMark}
            strokeWidth={2}
          />
        ) : meta ? (
          <text
            x={W / 2}
            y={CROWN_H / 2 + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
            fill={palette(meta.color)[dark ? 4 : 8]}
          >
            {meta.abbrev}
          </text>
        ) : null}

        {findings.length > 1 ? (
          <>
            <circle cx={W - 5} cy={6} r={6} fill={theme.colors.teal[7]} />
            <text
              x={W - 5}
              y={6}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={8}
              fontWeight={700}
              fill="#fff"
            >
              {findings.length}
            </text>
          </>
        ) : null}
      </svg>
    </Tooltip>
  );
}
