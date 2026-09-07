import { SimpleGrid } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

import { PatientCard } from "./PatientCard";
import { PatientTable } from "./PatientTable";
import type { Patient } from "../types/patient.types";

export function PatientListView({ patients }: { patients: Patient[] }) {
  const isCompact = useMediaQuery("(max-width: 62em)");

  if (isCompact) {
    return (
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
        {patients.map((p) => (
          <PatientCard key={p.patient_id} patient={p} />
        ))}
      </SimpleGrid>
    );
  }

  return <PatientTable patients={patients} />;
}
