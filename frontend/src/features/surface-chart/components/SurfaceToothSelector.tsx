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
            ? "var(--mantine-color-teal-6)"
            : "var(--mantine-color-gray-5)"
        }`,
        background:
          count > 0
            ? "var(--mantine-color-teal-1)"
            : "var(--mantine-color-body)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <Text size="10px" fw={600}>
        {count > 0 ? count : ""}
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
