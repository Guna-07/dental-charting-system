import { calcCal, type PerioAspect, type PerioSite } from "@/constants/dental/periodontal";

import { BleedingToggle } from "./BleedingToggle";
import { MeasurementInput } from "./MeasurementInput";
import type { SiteMeasurement } from "../types/gingival-chart.types";

export type CellRowKey = "pd" | "gm" | "cal" | "bop" | "plaque" | "suppuration";

interface MeasurementCellProps {
  rowKey: CellRowKey;
  tooth: string;
  aspect: PerioAspect;
  site: PerioSite;
  measurement: SiteMeasurement;
  range: { min: number; max: number };
  onNumber: (field: "pd" | "gm", value: number | null) => void;
  onToggle: (field: "bop" | "plaque" | "suppuration") => void;
}

const TOGGLE_COLOR: Record<string, string> = {
  bop: "red",
  plaque: "blue",
  suppuration: "yellow",
};

export function MeasurementCell({
  rowKey,
  tooth,
  aspect,
  site,
  measurement,
  range,
  onNumber,
  onToggle,
}: MeasurementCellProps) {
  const base = `Tooth ${tooth} ${aspect} ${site}`;

  if (rowKey === "cal") {
    const cal = calcCal(measurement.pd, measurement.gm);
    return (
      <span
        aria-label={`${base} attachment level ${cal ?? "not available"}`}
        style={{
          display: "inline-block",
          width: 32,
          textAlign: "center",
          fontSize: 12,
          fontWeight: 600,
          color:
            cal !== null && cal >= 4
              ? "var(--mantine-color-red-7)"
              : "var(--mantine-color-gray-6)",
        }}
      >
        {cal ?? "–"}
      </span>
    );
  }

  if (rowKey === "pd" || rowKey === "gm") {
    return (
      <MeasurementInput
        value={measurement[rowKey]}
        min={range.min}
        max={range.max}
        ariaLabel={`${base} ${rowKey.toUpperCase()}`}
        onChange={(v) => onNumber(rowKey, v)}
      />
    );
  }

  return (
    <BleedingToggle
      active={measurement[rowKey]}
      color={TOGGLE_COLOR[rowKey]}
      ariaLabel={`${base} ${rowKey}`}
      onToggle={() => onToggle(rowKey)}
    />
  );
}
