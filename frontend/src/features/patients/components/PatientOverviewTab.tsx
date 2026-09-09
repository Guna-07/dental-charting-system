import {
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

import type { ProfileTab } from "@/app/router/routes";
import { formatDate, formatDateTime, titleCase } from "@/utils/format";

import { usePatientSummary } from "../hooks/usePatientSummary";
import type { Patient } from "../types/patient.types";

interface PatientOverviewTabProps {
  patient: Patient;
  onNavigateTab: (tab: ProfileTab) => void;
}

const MAX_CONCERNS = 8;

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text size="sm">{value && value.length ? value : "—"}</Text>
    </Stack>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <Group justify="space-between">
      <Text size="sm">{label}</Text>
      <Text size="lg" fw={700} c={value > 0 ? undefined : "dimmed"}>
        {value}
      </Text>
    </Group>
  );
}

export function PatientOverviewTab({
  patient,
  onNavigateTab,
}: PatientOverviewTabProps) {
  const summary = usePatientSummary(patient.patient_id);

  const address = patient.address
    ? [
        patient.address.line1,
        patient.address.city,
        patient.address.state,
        patient.address.postal_code,
        patient.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const shownConcerns = summary.concerns.slice(0, MAX_CONCERNS);
  const hiddenConcerns = summary.concerns.length - shownConcerns.length;

  return (
    <Stack gap="lg">
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" h="100%">
            <Title order={5} mb="md">
              Examination Summary
            </Title>
            <Stack gap="sm">
              <StatRow label="Dental findings" value={summary.dentalCount} />
              <StatRow label="Surface findings" value={summary.surfaceCount} />
              <StatRow
                label="Periodontal entries"
                value={summary.periodontalCount}
              />
            </Stack>
            <Text size="xs" c="dimmed" mt="md">
              All three charts are keyed by the same FDI tooth number: the Dental
              Investigation chart records the tooth-level condition, the Surface
              chart the finding on a specific surface, and the Gingival chart the
              gum / periodontal measurements around it.
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" h="100%">
            <Title order={5} mb="md">
              Quick Access
            </Title>
            <Stack gap="xs">
              <Button
                variant="light"
                justify="space-between"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => onNavigateTab("dental")}
              >
                Dental Investigation
              </Button>
              <Button
                variant="light"
                justify="space-between"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => onNavigateTab("surface")}
              >
                Surface Chart
              </Button>
              <Button
                variant="light"
                justify="space-between"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => onNavigateTab("gingival")}
              >
                Gingival Examination
              </Button>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <Title order={5}>Existing Concerns</Title>
          {summary.concerns.length > 0 ? (
            <Badge variant="light" color="orange">
              {summary.concerns.length}
            </Badge>
          ) : null}
        </Group>

        {summary.loading ? (
          <Text size="sm" c="dimmed">
            Loading chart data…
          </Text>
        ) : summary.concerns.length === 0 ? (
          <Text size="sm" c="dimmed">
            No findings flagged — the charts are either clear or not started yet.
          </Text>
        ) : (
          <Stack gap="xs">
            {shownConcerns.map((c, i) => (
              <Group key={`${c.tooth}-${c.source}-${c.label}-${i}`} gap="sm" wrap="nowrap">
                <Badge variant="default" radius="sm" style={{ flexShrink: 0 }}>
                  Tooth {c.tooth}
                </Badge>
                <Text size="sm" fw={500}>
                  {c.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {c.source}
                  {c.detail ? ` · ${c.detail}` : ""}
                </Text>
              </Group>
            ))}
            {hiddenConcerns > 0 ? (
              <Text size="xs" c="dimmed">
                +{hiddenConcerns} more
              </Text>
            ) : null}
          </Stack>
        )}
      </Card>

      <Card withBorder padding="lg">
        <Title order={5} mb="md">
          Patient Details
        </Title>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md" verticalSpacing="md">
          <Field label="Date of birth" value={formatDate(patient.date_of_birth)} />
          <Field label="Age" value={`${patient.age}`} />
          <Field label="Gender" value={titleCase(patient.gender)} />
          <Field label="Blood group" value={patient.blood_group} />
          <Field label="Phone" value={patient.phone_number} />
          <Field label="Email" value={patient.email} />
          <Field label="Allergies" value={patient.allergies.join(", ")} />
          <Field
            label="Emergency contact"
            value={
              patient.emergency_contact?.name
                ? `${patient.emergency_contact.name}` +
                  (patient.emergency_contact.relationship
                    ? ` (${patient.emergency_contact.relationship})`
                    : "") +
                  (patient.emergency_contact.phone_number
                    ? ` · ${patient.emergency_contact.phone_number}`
                    : "")
                : ""
            }
          />
          <Field label="Address" value={address} />
          <Field label="Medical notes" value={patient.medical_notes} />
        </SimpleGrid>
      </Card>

      <Divider />
      <Text size="xs" c="dimmed">
        Created {formatDateTime(patient.created_at)} · Last updated{" "}
        {formatDateTime(patient.updated_at)}
      </Text>
    </Stack>
  );
}
