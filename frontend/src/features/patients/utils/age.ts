import dayjs from "dayjs";

import type { Patient, PatientFormValues } from "../types/patient.types";

export function ageFromDob(dob: string | Date | null | undefined): number | null {
  if (!dob) return null;
  const d = dayjs(dob);
  if (!d.isValid()) return null;
  return dayjs().diff(d, "year");
}

/** Convert the API payload into initial form values. */
export function toFormValues(patient?: Patient): PatientFormValues {
  return {
    first_name: patient?.first_name ?? "",
    last_name: patient?.last_name ?? "",
    date_of_birth: patient?.date_of_birth
      ? dayjs(patient.date_of_birth).toDate()
      : null,
    gender: patient?.gender ?? "",
    phone_number: patient?.phone_number ?? "",
    email: patient?.email ?? "",
    address: {
      line1: patient?.address?.line1 ?? "",
      city: patient?.address?.city ?? "",
      state: patient?.address?.state ?? "",
      postal_code: patient?.address?.postal_code ?? "",
      country: patient?.address?.country ?? "",
    },
    emergency_contact: {
      name: patient?.emergency_contact?.name ?? "",
      relationship: patient?.emergency_contact?.relationship ?? "",
      phone_number: patient?.emergency_contact?.phone_number ?? "",
    },
    medical_notes: patient?.medical_notes ?? "",
    allergies: (patient?.allergies ?? []).join(", "),
    blood_group: patient?.blood_group ?? "",
  };
}

/** Convert form values into the API request body, dropping empty optionals. */
export function toApiPayload(values: PatientFormValues) {
  const trimmedAddress = Object.fromEntries(
    Object.entries(values.address).filter(([, v]) => v.trim() !== ""),
  );
  const trimmedEmergency = Object.fromEntries(
    Object.entries(values.emergency_contact).filter(([, v]) => v.trim() !== ""),
  );
  const allergies = values.allergies
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  return {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    date_of_birth: values.date_of_birth
      ? dayjs(values.date_of_birth).format("YYYY-MM-DD")
      : "",
    gender: values.gender || undefined,
    phone_number: values.phone_number.trim(),
    email: values.email.trim() || null,
    address: Object.keys(trimmedAddress).length ? trimmedAddress : null,
    emergency_contact: Object.keys(trimmedEmergency).length
      ? trimmedEmergency
      : null,
    medical_notes: values.medical_notes.trim() || null,
    allergies,
    blood_group: values.blood_group || null,
  };
}
