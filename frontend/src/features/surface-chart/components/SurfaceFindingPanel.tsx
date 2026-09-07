import { Badge, Divider, Group, Stack, Text } from "@mantine/core";

import {
  surfaceFinding,
  type SurfaceFindingType,
} from "@/constants/dental/findings";
import { surfaceLabel, type Surface } from "@/constants/dental/surfaces";
import { formatDateTime } from "@/utils/format";

import { SurfaceFindingForm } from "./SurfaceFindingForm";
import type { SurfaceFindingEntry } from "../types/surface-chart.types";

interface SurfaceFindingPanelProps {
  toothNumber: string;
  entries: Partial<Record<Surface, SurfaceFindingEntry>>;
  selected: Surface[];
  busy?: boolean;
  onApply: (finding: SurfaceFindingType, notes: string) => void;
  onClear: () => void;
}

export function SurfaceFindingPanel({
  toothNumber,
  entries,
  selected,
  busy,
  onApply,
  onClear,
}: SurfaceFindingPanelProps) {
  const recorded = Object.entries(entries) as [Surface, SurfaceFindingEntry][];

  return (
    <Stack gap="md">
      <div>
        <Text fw={700} mb={4}>
          Tooth {toothNumber}
        </Text>
        <Text size="xs" c="dimmed">
          Click surfaces on the diagram to select them, then apply a finding.
        </Text>
      </div>

      <SurfaceFindingForm
        count={selected.length}
        busy={busy}
        onApply={onApply}
        onClear={onClear}
      />

      <Divider label="Recorded surfaces" labelPosition="left" />

      {recorded.length === 0 ? (
        <Text size="sm" c="dimmed">
          No surface findings on this tooth yet.
        </Text>
      ) : (
        <Stack gap="xs">
          {recorded.map(([surface, entry]) => {
            const meta = surfaceFinding(entry.finding);
            return (
              <Group key={surface} justify="space-between" wrap="nowrap">
                <Group gap="xs">
                  <Badge variant="light" color={meta.color}>
                    {surfaceLabel(toothNumber, surface)}
                  </Badge>
                  <Text size="sm">{meta.label}</Text>
                </Group>
                <Text size="10px" c="dimmed">
                  {formatDateTime(entry.updated_at)}
                </Text>
              </Group>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
