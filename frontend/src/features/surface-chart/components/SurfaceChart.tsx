import { useRef, useState } from "react";
import { Card, Center, Grid, Group, Stack, Text } from "@mantine/core";

import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { DownloadImageButton } from "@/components/common/DownloadImageButton";
import { DentitionToggle } from "@/components/dental/DentitionToggle";
import type { SurfaceFindingType } from "@/constants/dental/findings";
import { surfacesForTooth, type Surface } from "@/constants/dental/surfaces";
import type { Dentition } from "@/constants/dental/teeth";

import { SurfaceToothSelector } from "./SurfaceToothSelector";
import { ToothSurfaceDiagram } from "./ToothSurfaceDiagram";
import { SurfaceFindingPanel } from "./SurfaceFindingPanel";
import {
  useSurfaceChart,
  useUpdateToothSurfaces,
} from "../hooks/useSurfaceChart";

interface SurfaceChartProps {
  patientId: string;
  patientAge?: number | null;
}

export function SurfaceChart({ patientId, patientAge }: SurfaceChartProps) {
  const query = useSurfaceChart(patientId);
  const update = useUpdateToothSurfaces(patientId);

  const [dentition, setDentition] = useState<Dentition>("permanent");
  const [activeTooth, setActiveTooth] = useState<string | null>(null);
  const [selected, setSelected] = useState<Surface[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);

  const teeth = query.data?.teeth ?? {};
  const entries = activeTooth ? teeth[activeTooth]?.surfaces ?? {} : {};

  const pickTooth = (tooth: string) => {
    setActiveTooth(tooth);
    setSelected([]);
  };

  const toggleSurface = (surface: Surface) => {
    setSelected((prev) =>
      prev.includes(surface)
        ? prev.filter((s) => s !== surface)
        : [...prev, surface],
    );
  };

  const apply = (finding: SurfaceFindingType, notes: string) => {
    if (!activeTooth || selected.length === 0) return;
    update.mutate(
      {
        toothNumber: activeTooth,
        update: {
          surfaces: Object.fromEntries(
            selected.map((s) => [s, { finding, notes }]),
          ),
        },
      },
      { onSuccess: () => setSelected([]) },
    );
  };

  const clearSelected = () => {
    if (!activeTooth || selected.length === 0) return;
    update.mutate(
      {
        toothNumber: activeTooth,
        update: {
          surfaces: Object.fromEntries(selected.map((s) => [s, null])),
        },
      },
      { onSuccess: () => setSelected([]) },
    );
  };

  if (query.isLoading) return <LoadingState label="Loading surface chart…" />;
  if (query.isError)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <DentitionToggle
          value={dentition}
          onChange={(v) => {
            setDentition(v);
            setActiveTooth(null);
          }}
          patientAge={patientAge}
        />
        <DownloadImageButton
          targetRef={exportRef}
          filename={`surface-chart-${patientId}-${new Date()
            .toISOString()
            .slice(0, 10)}`}
        />
      </Group>

      <Stack gap="lg" ref={exportRef}>
        <Card withBorder padding="lg">
          <SurfaceToothSelector
            dentition={dentition}
            teeth={teeth}
            activeTooth={activeTooth}
            onSelect={pickTooth}
          />
        </Card>

        {activeTooth ? (
          <Grid>
            <Grid.Col span={{ base: 12, md: 5 }} className="surface-diagram-col">
              <Card withBorder padding="lg">
                <Center>
                  <ToothSurfaceDiagram
                    toothNumber={activeTooth}
                    entries={entries}
                    selected={selected}
                    onToggle={toggleSurface}
                  />
                </Center>
                <Text size="xs" c="dimmed" ta="center" mt="sm">
                  Surfaces: {surfacesForTooth(activeTooth).join(" · ")}
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 7 }} className="no-export">
              <Card withBorder padding="lg">
                <SurfaceFindingPanel
                  toothNumber={activeTooth}
                  entries={entries}
                  selected={selected}
                  busy={update.isPending}
                  onApply={apply}
                  onClear={clearSelected}
                />
              </Card>
            </Grid.Col>
          </Grid>
        ) : (
          <EmptyState
            title="Select a tooth"
            description="Pick a tooth above to view its surfaces and record findings."
          />
        )}
      </Stack>
    </Stack>
  );
}
