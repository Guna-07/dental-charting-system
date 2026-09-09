import { useRouter } from "next/router";
import { ActionIcon, Badge, Card, Group, Stack, Text } from "@mantine/core";
import { IconPencil, IconPhone, IconTrash } from "@tabler/icons-react";

import { routes } from "@/app/router/routes";
import { fullName, titleCase } from "@/utils/format";

import type { Patient } from "../types/patient.types";

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export function PatientCard({ patient, onEdit, onDelete }: PatientCardProps) {
  const router = useRouter();
  const name = fullName(patient.first_name, patient.last_name);

  return (
    <Card
      withBorder
      padding="md"
      style={{ cursor: "pointer" }}
      onClick={() => router.push(routes.patientProfile(patient.patient_id))}
    >
      <Stack gap={6}>
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600} truncate>
            {name}
          </Text>
          <Badge variant="light" size="sm">
            {patient.patient_id}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">
          {patient.age} yrs · {titleCase(patient.gender)}
        </Text>
        <Group justify="space-between" wrap="nowrap">
          <Group gap={6} c="dimmed" wrap="nowrap">
            <IconPhone size={14} />
            <Text size="sm">{patient.phone_number}</Text>
          </Group>
          <Group gap={4} wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label={`Edit ${name}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(patient);
              }}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              aria-label={`Delete ${name}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(patient);
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
