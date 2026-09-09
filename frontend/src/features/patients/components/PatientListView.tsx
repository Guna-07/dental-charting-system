import { useState } from "react";
import { SimpleGrid } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { fullName } from "@/utils/format";

import { PatientCard } from "./PatientCard";
import { PatientFormModal } from "./PatientFormModal";
import { PatientTable } from "./PatientTable";
import { useDeletePatient } from "../hooks/usePatientMutations";
import type { Patient } from "../types/patient.types";

export function PatientListView({ patients }: { patients: Patient[] }) {
  // Explicit initial value + getInitialValueInEffect => server and first client
  // render agree (table), then it switches to cards after mount if narrow.
  const isCompact = useMediaQuery("(max-width: 62em)", false, {
    getInitialValueInEffect: true,
  });

  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const deleteMutation = useDeletePatient();

  const confirmDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.patient_id, {
      onSuccess: () => setDeleting(null),
    });
  };

  const list = isCompact ? (
    <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
      {patients.map((p) => (
        <PatientCard
          key={p.patient_id}
          patient={p}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      ))}
    </SimpleGrid>
  ) : (
    <PatientTable
      patients={patients}
      onEdit={setEditing}
      onDelete={setDeleting}
    />
  );

  return (
    <>
      {list}

      <PatientFormModal
        opened={editing !== null}
        onClose={() => setEditing(null)}
        mode="edit"
        patient={editing ?? undefined}
      />

      <ConfirmDialog
        opened={deleting !== null}
        title="Delete patient"
        message={
          deleting
            ? `Delete ${fullName(deleting.first_name, deleting.last_name)} (${deleting.patient_id})? ` +
              "This also permanently deletes their dental, surface and gingival charts and cannot be undone."
            : ""
        }
        confirmLabel="Delete patient"
        danger
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
