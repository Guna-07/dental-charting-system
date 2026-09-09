import { Box, Text, UnstyledButton } from "@mantine/core";

import { ArchRow } from "@/components/dental/ArchRow";
import type { Dentition } from "@/constants/dental/teeth";

import type { ToothSurfaces } from "../types/surface-chart.types";

interface SurfaceToothSelectorProps {
  dentition: Dentition;
  teeth: Record<string, ToothSurfaces>;
  activeTooth: string | null;
  onSelect: (toothNumber: string) => void;
}

function MiniTooth({
  toothNumber,
  count,
  active,
  onSelect,
}: {
  toothNumber: string;
  count: number;
  active: boolean;
  onSelect: (t: string) => void;
}) {
  const hasFindings = count > 0;
  return (
    <UnstyledButton
      onClick={() => onSelect(toothNumber)}
      aria-pressed={active}
      aria-label={`Tooth ${toothNumber}, ${count} surface findings`}
      style={{
        width: 30,
        height: 30,
        borderRadius: 6,
        border: `${active ? 2.5 : 1}px solid ${
          active
            ? "var(--mantine-color-teal-filled)"
            : "var(--mantine-color-default-border)"
        }`,
        background: hasFindings
          ? "var(--mantine-color-teal-light)"
          : "var(--mantine-color-default)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        size="11px"
        fw={700}
        style={{
          color: hasFindings
            ? "var(--mantine-color-teal-light-color)"
            : "var(--mantine-color-text)",
        }}
      >
        {hasFindings ? count : ""}
      </Text>
    </UnstyledButton>
  );
}

export function SurfaceToothSelector({
  dentition,
  teeth,
  activeTooth,
  onSelect,
}: SurfaceToothSelectorProps) {
  const render = (tooth: string) => (
    <MiniTooth
      toothNumber={tooth}
      count={Object.keys(teeth[tooth]?.surfaces ?? {}).length}
      active={activeTooth === tooth}
      onSelect={onSelect}
    />
  );

  return (
    <Box>
      <Text size="xs" c="dimmed" ta="center" tt="uppercase" fw={600} mb={4}>
        Upper
      </Text>
      <ArchRow arch="upper" dentition={dentition} renderTooth={render} />
      <Text size="xs" c="dimmed" ta="center" tt="uppercase" fw={600} mt="md" mb={4}>
        Lower
      </Text>
      <ArchRow
        arch="lower"
        dentition={dentition}
        numbersOnTop
        renderTooth={render}
      />
    </Box>
  );
}
