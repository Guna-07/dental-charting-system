import { useEffect } from "react";
import {
  Button,
  Grid,
  Group,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";

import { ageFromDob, toApiPayload, toFormValues } from "../utils/age";
import type { Patient, PatientFormValues } from "../types/patient.types";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Undisclosed" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
  (v) => ({ value: v, label: v }),
);

interface PatientFormProps {
  mode: "create" | "edit";
  patient?: Patient;
  submitting?: boolean;
  onSubmit: (payload: ReturnType<typeof toApiPayload>) => void;
  onCancel: () => void;
}

export function PatientForm({
  mode,
  patient,
  submitting,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const form = useForm<PatientFormValues>({
    initialValues: toFormValues(patient),
    validate: {
      first_name: (v) => (v.trim().length ? null : "First name is required"),
      last_name: (v) => (v.trim().length ? null : "Last name is required"),
      date_of_birth: (v) => {
        if (!v) return "Date of birth is required";
        if (dayjs(v).isAfter(dayjs(), "day")) return "Cannot be in the future";
        if (dayjs().diff(dayjs(v), "year") > 120) return "Age looks implausible";
        return null;
      },
      gender: (v) => (v ? null : "Gender is required"),
      phone_number: (v) =>
        (v.replace(/\D/g, "").length >= 6 ? null : "Enter a valid phone number"),
      email: (v) =>
        !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email",
    },
  });

  useEffect(() => {
    form.setValues(toFormValues(patient));
    form.resetDirty(toFormValues(patient));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.patient_id]);

  const age = ageFromDob(form.values.date_of_birth);

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(toApiPayload(values)))}>
      <Stack gap="md">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="First name"
              withAsterisk
              {...form.getInputProps("first_name")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Last name"
              withAsterisk
              {...form.getInputProps("last_name")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DateInput
              label="Date of birth"
              withAsterisk
              valueFormat="DD MMM YYYY"
              maxDate={new Date()}
              description={age !== null ? `Age: ${age}` : undefined}
              {...form.getInputProps("date_of_birth")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Gender"
              withAsterisk
              data={GENDER_OPTIONS}
              {...form.getInputProps("gender")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Phone number"
              withAsterisk
              placeholder="+91 98765 43210"
              {...form.getInputProps("phone_number")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Email"
              placeholder="name@example.com"
              {...form.getInputProps("email")}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput label="Address line" {...form.getInputProps("address.line1")} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <TextInput label="City" {...form.getInputProps("address.city")} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <TextInput label="State" {...form.getInputProps("address.state")} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <TextInput
              label="Postal code"
              {...form.getInputProps("address.postal_code")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <TextInput label="Country" {...form.getInputProps("address.country")} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Blood group"
              clearable
              data={BLOOD_GROUPS}
              {...form.getInputProps("blood_group")}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextInput
              label="Emergency contact"
              {...form.getInputProps("emergency_contact.name")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 4 }}>
            <TextInput
              label="Relationship"
              {...form.getInputProps("emergency_contact.relationship")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 4 }}>
            <TextInput
              label="Contact phone"
              {...form.getInputProps("emergency_contact.phone_number")}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              label="Allergies"
              description="Comma-separated"
              placeholder="Penicillin, Latex"
              {...form.getInputProps("allergies")}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Medical notes"
              autosize
              minRows={2}
              {...form.getInputProps("medical_notes")}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {mode === "create" ? "Create patient" : "Save changes"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
