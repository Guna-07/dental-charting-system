import { useRouter } from "next/router";
import { Badge, Table, Text } from "@mantine/core";

import { routes } from "@/app/router/routes";
import { fullName, titleCase } from "@/utils/format";

import type { Patient } from "../types/patient.types";

export function PatientTable({ patients }: { patients: Patient[] }) {
  const router = useRouter();

  return (
    <Table.ScrollContainer minWidth={640}>
      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Patient ID</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Age</Table.Th>
            <Table.Th>Gender</Table.Th>
            <Table.Th>Phone</Table.Th>
            <Table.Th>Email</Table.Th>
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
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
