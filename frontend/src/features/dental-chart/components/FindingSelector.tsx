import { useState } from "react";
import { Button, Group, Select, Stack, Textarea } from "@mantine/core";

import {
  FINDING_STATUS_OPTIONS,
  INVESTIGATION_FINDINGS,
  type FindingStatus,
  type InvestigationFindingType,
} from "@/constants/dental/findings";

export interface DraftFinding {
  id?: string;
  type: InvestigationFindingType;
  status: FindingStatus;
  notes: string;
}

interface FindingSelectorProps {
  initial?: DraftFinding;
  defaultStatus: FindingStatus;
  onSubmit: (finding: DraftFinding) => void;
  onCancel?: () => void;
  busy?: boolean;
}

export function FindingSelector({
  initial,
  defaultStatus,
  onSubmit,
  onCancel,
  busy,
}: FindingSelectorProps) {
  const [type, setType] = useState<InvestigationFindingType>(
    initial?.type ?? "caries",
  );
  const [status, setStatus] = useState<FindingStatus>(
    initial?.status ?? defaultStatus,
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");

  return (
    <Stack gap="sm">
      <Select
        label="Finding"
        data={INVESTIGATION_FINDINGS.map((f) => ({
          value: f.value,
          label: f.label,
        }))}
        value={type}
        onChange={(v) => v && setType(v as InvestigationFindingType)}
        allowDeselect={false}
      />
      <Select
        label="Layer"
        data={FINDING_STATUS_OPTIONS}
        value={status}
        onChange={(v) => v && setStatus(v as FindingStatus)}
        allowDeselect={false}
      />
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
      />
      <Group justify="flex-end">
        {onCancel ? (
          <Button variant="default" size="xs" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        ) : null}
        <Button
          size="xs"
          loading={busy}
          onClick={() => onSubmit({ id: initial?.id, type, status, notes })}
        >
          {initial ? "Update finding" : "Add finding"}
        </Button>
      </Group>
    </Stack>
  );
}
