import { Card, Grid, Group, Stack, Text, Title } from "@mantine/core";

import { formatDate, formatDateTime, titleCase } from "@/utils/format";

import type { Patient } from "../types/patient.types";

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

export function PatientOverviewTab({ patient }: { patient: Patient }) {
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

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder padding="lg" h="100%">
          <Title order={5} mb="md">
            Demographics
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <Field label="Date of birth" value={formatDate(patient.date_of_birth)} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Field label="Age" value={`${patient.age}`} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Field label="Gender" value={titleCase(patient.gender)} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Field label="Blood group" value={patient.blood_group} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Field label="Phone" value={patient.phone_number} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Field label="Email" value={patient.email} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Field label="Address" value={address} />
            </Grid.Col>
          </Grid>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder padding="lg" h="100%">
          <Title order={5} mb="md">
            Medical
          </Title>
          <Stack gap="md">
            <Field
              label="Allergies"
              value={patient.allergies.length ? patient.allergies.join(", ") : ""}
            />
            <Field label="Medical notes" value={patient.medical_notes} />
            <Group grow>
              <Field
                label="Emergency contact"
                value={patient.emergency_contact?.name}
              />
              <Field
                label="Relationship"
                value={patient.emergency_contact?.relationship}
              />
            </Group>
            <Field
              label="Emergency phone"
              value={patient.emergency_contact?.phone_number}
            />
          </Stack>
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Text size="xs" c="dimmed">
          Created {formatDateTime(patient.created_at)} · Last updated{" "}
          {formatDateTime(patient.updated_at)}
        </Text>
      </Grid.Col>
    </Grid>
  );
}
