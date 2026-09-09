import { useRouter } from "next/router";
import { ActionIcon, Badge, Group, Table, Text } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import { routes } from "@/app/router/routes";
import { fullName, titleCase } from "@/utils/format";

import type { Patient } from "../types/patient.types";

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export function PatientTable({ patients, onEdit, onDelete }: PatientTableProps) {
  const router = useRouter();

  return (
    <Table.ScrollContainer minWidth={720}>
      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Patient ID</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Age</Table.Th>
            <Table.Th>Gender</Table.Th>
            <Table.Th>Phone</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th w={96}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {patients.map((p) => (
            <Table.Tr
              key={p.patient_id}
              style={{ cursor: "pointer" }}
              onClick={() => router.push(routes.patientProfile(p.patient_id))}
            >
              <Table.Td>
                <Badge variant="light">{p.patient_id}</Badge>
              </Table.Td>
              <Table.Td fw={500}>{fullName(p.first_name, p.last_name)}</Table.Td>
              <Table.Td>{p.age}</Table.Td>
              <Table.Td>{titleCase(p.gender)}</Table.Td>
              <Table.Td>{p.phone_number}</Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {p.email || "—"}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap={4} wrap="nowrap" justify="flex-end">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label={`Edit ${fullName(p.first_name, p.last_name)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(p);
                    }}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Delete ${fullName(p.first_name, p.last_name)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(p);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
