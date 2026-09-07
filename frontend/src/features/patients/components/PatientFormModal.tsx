import { Modal } from "@mantine/core";
import { useRouter } from "next/router";

import { routes } from "@/app/router/routes";

import { PatientForm } from "./PatientForm";
import { useCreatePatient, useUpdatePatient } from "../hooks/usePatientMutations";
import type { Patient } from "../types/patient.types";

interface PatientFormModalProps {
  opened: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  patient?: Patient;
}

export function PatientFormModal({
  opened,
  onClose,
  mode,
  patient,
}: PatientFormModalProps) {
  const router = useRouter();
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient(patient?.patient_id ?? "");

  const submitting =
    mode === "create" ? createMutation.isPending : updateMutation.isPending;

  const handleSubmit = (payload: Record<string, unknown>) => {
    console.log(payload);
    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: (created) => {
          onClose();
          router.push(routes.patientProfile(created.patient_id));
        },
      });
    } else {
      updateMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === "create" ? "Add patient" : "Edit patient"}
      size="lg"
      centered
    >
      <PatientForm
        key={`${mode}-${patient?.patient_id ?? "new"}-${opened}`}
        mode={mode}
        patient={patient}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
