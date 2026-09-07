import Link from "next/link";
import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { IconPhone } from "@tabler/icons-react";

import { routes } from "@/app/router/routes";
import { fullName, titleCase } from "@/utils/format";

import type { Patient } from "../types/patient.types";

export function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Link
      href={routes.patientProfile(patient.patient_id)}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Card withBorder padding="md">
        <Stack gap={6}>
          <Group justify="space-between" wrap="nowrap">
            <Text fw={600} truncate>
              {fullName(patient.first_name, patient.last_name)}
            </Text>
            <Badge variant="light" size="sm">
              {patient.patient_id}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            {patient.age} yrs · {titleCase(patient.gender)}
          </Text>
          <Group gap={6} c="dimmed">
            <IconPhone size={14} />
            <Text size="sm">{patient.phone_number}</Text>
          </Group>
        </Stack>
      </Card>
    </Link>
  );
}
