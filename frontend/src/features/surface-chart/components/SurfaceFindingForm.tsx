import { useState } from "react";
import { Button, Group, Select, Stack, Textarea } from "@mantine/core";

import {
  SURFACE_FINDINGS,
  type SurfaceFindingType,
} from "@/constants/dental/findings";

interface SurfaceFindingFormProps {
  count: number;
  busy?: boolean;
  onApply: (finding: SurfaceFindingType, notes: string) => void;
  onClear: () => void;
}

export function SurfaceFindingForm({
  count,
  busy,
  onApply,
  onClear,
}: SurfaceFindingFormProps) {
  const [finding, setFinding] = useState<SurfaceFindingType>("caries");
  const [notes, setNotes] = useState("");

  return (
    <Stack gap="sm">
      <Select
        label={`Finding for ${count} selected surface${count === 1 ? "" : "s"}`}
        data={SURFACE_FINDINGS.map((f) => ({ value: f.value, label: f.label }))}
        value={finding}
        onChange={(v) => v && setFinding(v as SurfaceFindingType)}
        allowDeselect={false}
      />
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
      />
      <Group justify="space-between">
        <Button
          variant="subtle"
          color="red"
          size="xs"
          disabled={busy || count === 0}
          onClick={onClear}
        >
          Clear selected
        </Button>
        <Button
          size="xs"
          loading={busy}
          disabled={count === 0}
          onClick={() => onApply(finding, notes)}
        >
          Apply
        </Button>
      </Group>
    </Stack>
  );
}
