import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconPlus, IconTrash, IconX } from "@tabler/icons-react";

import {
  investigationFinding,
  type FindingStatus,
} from "@/constants/dental/findings";
import { formatDateTime } from "@/utils/format";

import { FindingSelector, type DraftFinding } from "./FindingSelector";
import type { ToothInvestigation } from "../types/dental-chart.types";

interface ToothDetailsPanelProps {
  toothNumber: string;
  tooth?: ToothInvestigation;
  activeStatus: FindingStatus;
  busy?: boolean;
  onClose: () => void;
  onSave: (findings: DraftFinding[], notes: string) => void;
  onClearTooth: () => void;
}

/**
 * Inline details panel for the selected tooth — rendered in the page flow below
 * the chart, matching the Surface and Gingival charts (no slide-in drawer).
 */
export function ToothDetailsPanel({
  toothNumber,
  tooth,
  activeStatus,
  busy,
  onClose,
  onSave,
  onClearTooth,
}: ToothDetailsPanelProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Remounts per tooth (key in the parent), so this fires on every selection —
  // bring the panel into view since the arches push it below the fold.
  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const findings = tooth?.findings ?? [];

  const persist = (next: DraftFinding[]) => {
    onSave(next, tooth?.notes ?? "");
    setAdding(false);
    setEditingId(null);
  };

  const toDraft = (): DraftFinding[] =>
    findings.map((f) => ({
      id: f.id,
      type: f.type,
      status: f.status,
      notes: f.notes,
    }));

  const handleAdd = (finding: DraftFinding) => persist([...toDraft(), finding]);

  const handleEdit = (finding: DraftFinding) =>
    persist(toDraft().map((f) => (f.id === finding.id ? finding : f)));

  const handleRemove = (id: string) =>
    persist(toDraft().filter((f) => f.id !== id));

  return (
    <Card ref={cardRef} withBorder padding="lg" style={{ scrollMarginTop: 76 }}>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Text fw={700}>Tooth {toothNumber}</Text>
          {tooth?.dentition ? (
            <Badge size="sm" variant="light">
              {tooth.dentition}
            </Badge>
          ) : null}
        </Group>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={onClose}
          aria-label="Close tooth details"
        >
          <IconX size={18} />
        </ActionIcon>
      </Group>

      <Stack gap="md">
        {findings.length === 0 && !adding ? (
          <Text c="dimmed" size="sm">
            No findings recorded for this tooth.
          </Text>
        ) : null}

        {findings.map((f) => {
          const meta = investigationFinding(f.type);
          return (
            <div key={f.id}>
              {editingId === f.id ? (
                <FindingSelector
                  initial={{
                    id: f.id,
                    type: f.type,
                    status: f.status,
                    notes: f.notes,
                  }}
                  defaultStatus={activeStatus}
                  busy={busy}
                  onSubmit={handleEdit}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Group gap="sm" wrap="nowrap" align="flex-start">
                    <ThemeIcon
                      variant="light"
                      color={meta.color}
                      radius="xl"
                      size="md"
                    >
                      <Text size="xs" fw={700}>
                        {meta.abbrev}
                      </Text>
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Text size="sm" fw={600}>
                        {meta.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {f.status === "current"
                          ? "Current condition"
                          : "Treatment required"}
                      </Text>
                      {f.notes ? <Text size="xs">{f.notes}</Text> : null}
                      <Text size="10px" c="dimmed">
                        Updated {formatDateTime(f.updated_at)}
                      </Text>
                    </Stack>
                  </Group>
                  <Group gap={4} wrap="nowrap">
                    <Button
                      size="compact-xs"
                      variant="subtle"
                      onClick={() => setEditingId(f.id)}
                    >
                      Edit
                    </Button>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => handleRemove(f.id)}
                      aria-label="Remove finding"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              )}
              <Divider my="sm" />
            </div>
          );
        })}

        {adding ? (
          <FindingSelector
            defaultStatus={activeStatus}
            busy={busy}
            onSubmit={handleAdd}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => setAdding(true)}
          >
            Add finding
          </Button>
        )}

        {findings.length > 0 ? (
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={onClearTooth}
            disabled={busy}
          >
            Clear all findings on this tooth
          </Button>
        ) : null}
      </Stack>
    </Card>
  );
}
