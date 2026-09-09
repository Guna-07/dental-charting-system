import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { IconDeviceFloppy, IconRotate } from "@tabler/icons-react";

import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { DownloadImageButton } from "@/components/common/DownloadImageButton";
import { useUnsavedChangesPrompt } from "@/hooks/useUnsavedChangesPrompt";
import { PERMANENT_UPPER, PERMANENT_LOWER } from "@/constants/dental/teeth";

import { PeriodontalArch } from "./PeriodontalArch";
import {
  useGingivalChart,
  useSaveGingivalChart,
} from "../hooks/useGingivalChart";
import { draftToUpdate, useGingivalDraft } from "../hooks/useGingivalDraft";

type ArchName = "upper" | "lower";

export function GingivalChart({ patientId }: { patientId: string }) {
  const query = useGingivalChart(patientId);
  const save = useSaveGingivalChart(patientId);
  const { draft, isDirty, reinit, setSite, setTooth } = useGingivalDraft(
    query.data,
  );
  const exportRef = useRef<HTMLDivElement>(null);
  const [arch, setArch] = useState<ArchName>("upper");

  // Re-seed the draft whenever fresh server data arrives (and after a save).
  useEffect(() => {
    if (query.data) reinit(query.data);
  }, [query.data, reinit]);

  useUnsavedChangesPrompt(isDirty);

  if (query.isLoading) return <LoadingState label="Loading periodontal chart…" />;
  if (query.isError)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const handleSave = () => save.mutate(draftToUpdate(draft));

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <SegmentedControl
          value={arch}
          onChange={(v) => setArch(v as ArchName)}
          data={[
            { label: "Upper", value: "upper" },
            { label: "Lower", value: "lower" },
          ]}
        />
        <DownloadImageButton
          targetRef={exportRef}
          filename={`gingival-chart-${patientId}-${new Date()
            .toISOString()
            .slice(0, 10)}`}
        />
      </Group>

      <Text size="xs" c="dimmed">
        Enter measurements inline (numbers only). Nothing is written to the server
        until you press <strong>Save</strong>. Six sites per tooth (Facial &amp;
        Lingual × Mesial / Mid / Distal). Permanent dentition. The exported image
        always contains both arches.
      </Text>

      {/* Both arches stay mounted (so the draft and the PNG export keep the full
          chart); the inactive one is hidden via CSS for a compact view. */}
      <Stack gap="md" ref={exportRef}>
        <Card
          withBorder
          padding="md"
          className={arch === "upper" ? undefined : "gingival-arch-hidden"}
        >
          <PeriodontalArch
            title="Upper arch"
            teeth={PERMANENT_UPPER}
            draft={draft}
            setSite={setSite}
            setTooth={setTooth}
          />
        </Card>
        <Card
          withBorder
          padding="md"
          className={arch === "lower" ? undefined : "gingival-arch-hidden"}
        >
          <PeriodontalArch
            title="Lower arch"
            teeth={PERMANENT_LOWER}
            draft={draft}
            setSite={setSite}
            setTooth={setTooth}
          />
        </Card>
      </Stack>

      <Paper
        withBorder
        p="sm"
        style={{
          position: "sticky",
          bottom: 12,
          zIndex: 5,
          backdropFilter: "blur(4px)",
        }}
      >
        <Group justify="space-between">
          <Text size="sm" c={isDirty ? "orange" : "dimmed"}>
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </Text>
          <Group gap="sm">
            <Button
              variant="default"
              leftSection={<IconRotate size={16} />}
              disabled={!isDirty || save.isPending}
              onClick={() => reinit(query.data)}
            >
              Discard
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              loading={save.isPending}
              disabled={!isDirty}
              onClick={handleSave}
            >
              Save chart
            </Button>
          </Group>
        </Group>
      </Paper>
    </Stack>
  );
}
