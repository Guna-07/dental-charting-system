import { useMemo, useState } from "react";
import {
  Badge,
  Card,
  Group,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";

import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { INVESTIGATION_FINDINGS, type FindingStatus } from "@/constants/dental/findings";
import type { Dentition } from "@/constants/dental/teeth";

import { DentalArch } from "./DentalArch";
import { ToothDetailsPanel } from "./ToothDetailsPanel";
import type { DraftFinding } from "./FindingSelector";
import {
  useClearTooth,
  useDentalChart,
  useUpsertTooth,
} from "../hooks/useDentalChart";
import type { ToothFinding } from "../types/dental-chart.types";

type PanelMode = "current" | "planned" | "both";

const LEGEND = INVESTIGATION_FINDINGS.filter((f) =>
  ["caries", "missing", "filled", "crown", "root_canal_treated", "healthy"].includes(
    f.value,
  ),
);

export function DentalChart({ patientId }: { patientId: string }) {
  const query = useDentalChart(patientId);
  const upsert = useUpsertTooth(patientId);
  const clear = useClearTooth(patientId);

  const [dentition, setDentition] = useState<Dentition>("permanent");
  const [mode, setMode] = useState<PanelMode>("current");
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);

  const teeth = query.data?.teeth ?? {};

  const findingsFor = useMemo(
    () =>
      (toothNumber: string, status?: FindingStatus): ToothFinding[] => {
        const all = teeth[toothNumber]?.findings ?? [];
        return status ? all.filter((f) => f.status === status) : all;
      },
    [teeth],
  );

  const activeStatus: FindingStatus = mode === "planned" ? "planned" : "current";

  const handleSave = (findings: DraftFinding[], notes: string) => {
    if (!selectedTooth) return;
    upsert.mutate({
      toothNumber: selectedTooth,
      input: {
        notes,
        findings: findings.map((f) => ({
          id: f.id,
          type: f.type,
          status: f.status,
          notes: f.notes,
        })),
      },
    });
  };

  if (query.isLoading) return <LoadingState label="Loading dental chart…" />;
  if (query.isError)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const panels: { key: PanelMode; title: string; status: FindingStatus }[] =
    mode === "both"
      ? [
          { key: "current", title: "Current Condition", status: "current" },
          { key: "planned", title: "Treatment Required", status: "planned" },
        ]
      : [
          {
            key: mode,
            title: mode === "planned" ? "Treatment Required" : "Current Condition",
            status: activeStatus,
          },
        ];

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as PanelMode)}
          data={[
            { label: "Current Condition", value: "current" },
            { label: "Treatment Required", value: "planned" },
            { label: "Both", value: "both" },
          ]}
        />
        <SegmentedControl
          value={dentition}
          onChange={(v) => setDentition(v as Dentition)}
          data={[
            { label: "Permanent", value: "permanent" },
            { label: "Primary", value: "primary" },
          ]}
        />
      </Group>

      <Group gap="md" wrap="wrap">
        {LEGEND.map((f) => (
          <Group gap={6} key={f.value}>
            <Badge variant="light" color={f.color} radius="sm">
              {f.abbrev}
            </Badge>
            <Text size="xs" c="dimmed">
              {f.label}
            </Text>
          </Group>
        ))}
      </Group>

      {panels.map((panel) => (
        <Card key={panel.key} withBorder padding="lg">
          <Text fw={700} size="sm" mb="md">
            {panel.title}
          </Text>
          <Stack gap="xl">
            <DentalArch
              arch="upper"
              dentition={dentition}
              getFindings={(t) => findingsFor(t, panel.status)}
              selectedTooth={selectedTooth}
              onSelect={setSelectedTooth}
            />
            <DentalArch
              arch="lower"
              dentition={dentition}
              getFindings={(t) => findingsFor(t, panel.status)}
              selectedTooth={selectedTooth}
              onSelect={setSelectedTooth}
            />
          </Stack>
        </Card>
      ))}

      <Text size="xs" c="dimmed">
        Click any tooth to record or edit findings. Numbering: FDI (ISO 3950).
      </Text>

      <ToothDetailsPanel
        opened={selectedTooth !== null}
        toothNumber={selectedTooth}
        tooth={selectedTooth ? teeth[selectedTooth] : undefined}
        activeStatus={activeStatus}
        busy={upsert.isPending || clear.isPending}
        onClose={() => setSelectedTooth(null)}
        onSave={handleSave}
        onClearTooth={() => selectedTooth && clear.mutate(selectedTooth)}
      />
    </Stack>
  );
}
