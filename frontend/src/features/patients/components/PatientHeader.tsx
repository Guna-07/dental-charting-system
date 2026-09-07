import Link from "next/link";
import { Badge, Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft, IconPencil } from "@tabler/icons-react";

import { routes } from "@/app/router/routes";
import { fullName, titleCase } from "@/utils/format";

import type { Patient } from "../types/patient.types";

interface PatientHeaderProps {
  patient: Patient;
  onEdit: () => void;
}

export function PatientHeader({ patient, onEdit }: PatientHeaderProps) {
  return (
    <Stack gap="sm" mb="lg">
      <Group justify="space-between" wrap="wrap">
        <Button
          component={Link}
          href={routes.patients()}
          variant="subtle"
          size="compact-sm"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Patients
        </Button>
        <Button
          variant="light"
          size="compact-sm"
          leftSection={<IconPencil size={16} />}
          onClick={onEdit}
        >
          Edit Patient
        </Button>
      </Group>

      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Stack gap={2}>
          <Title order={2}>
            {fullName(patient.first_name, patient.last_name)}
          </Title>
          <Group gap="xs">
            <Badge variant="light">{patient.patient_id}</Badge>
            <Text c="dimmed" size="sm">
              {patient.age} yrs · {titleCase(patient.gender)} ·{" "}
              {patient.phone_number}
            </Text>
          </Group>
        </Stack>
      </Group>
    </Stack>
  );
}
