import { useEffect } from "react";
import { Button, Card, Group, Paper, Stack, Text } from "@mantine/core";
import { IconDeviceFloppy, IconRotate } from "@tabler/icons-react";

import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useUnsavedChangesPrompt } from "@/hooks/useUnsavedChangesPrompt";
import { PERMANENT_UPPER, PERMANENT_LOWER } from "@/constants/dental/teeth";

import { PeriodontalArch } from "./PeriodontalArch";
import {
  useGingivalChart,
  useSaveGingivalChart,
} from "../hooks/useGingivalChart";
import { draftToUpdate, useGingivalDraft } from "../hooks/useGingivalDraft";

export function GingivalChart({ patientId }: { patientId: string }) {
  const query = useGingivalChart(patientId);
  const save = useSaveGingivalChart(patientId);
  const { draft, isDirty, reinit, setSite, setTooth } = useGingivalDraft(
    query.data,
  );

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
      <Text size="xs" c="dimmed">
        Enter measurements inline. Nothing is written to the server until you
        press <strong>Save</strong>. Six sites per tooth (Facial &amp; Lingual ×
        Mesial / Mid / Distal). Permanent dentition.
      </Text>

      <Card withBorder padding="md">
        <PeriodontalArch
          title="Upper arch"
          teeth={PERMANENT_UPPER}
          draft={draft}
          setSite={setSite}
          setTooth={setTooth}
        />
      </Card>
      <Card withBorder padding="md">
        <PeriodontalArch
          title="Lower arch"
          teeth={PERMANENT_LOWER}
          draft={draft}
          setSite={setSite}
          setTooth={setTooth}
        />
      </Card>

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
