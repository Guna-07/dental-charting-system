import { Box, Text } from "@mantine/core";

import { ArchRow } from "@/components/dental/ArchRow";
import type { ArchName, Dentition } from "@/constants/dental/teeth";

import { Tooth } from "./Tooth";
import type { ToothFinding } from "../types/dental-chart.types";

interface DentalArchProps {
  arch: ArchName;
  dentition: Dentition;
  getFindings: (toothNumber: string) => ToothFinding[];
  selectedTooth: string | null;
  onSelect: (toothNumber: string) => void;
}

export function DentalArch({
  arch,
  dentition,
  getFindings,
  selectedTooth,
  onSelect,
}: DentalArchProps) {
  return (
    <Box>
      <Text size="xs" c="dimmed" mb={4} ta="center" tt="uppercase" fw={600}>
        {arch === "upper" ? "Upper arch" : "Lower arch"}
      </Text>
      <ArchRow
        arch={arch}
        dentition={dentition}
        numbersOnTop={arch === "lower"}
        renderTooth={(tooth) => (
          <Tooth
            toothNumber={tooth}
            findings={getFindings(tooth)}
            selected={selectedTooth === tooth}
            onSelect={onSelect}
          />
        )}
      />
    </Box>
  );
}
