import type { Paginated } from "@/types/api.types";

export type Gender = "male" | "female" | "other" | "undisclosed";
export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export interface Address {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

export interface EmergencyContact {
  name?: string | null;
  relationship?: string | null;
  phone_number?: string | null;
}

export interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age: number;
  gender: Gender;
  phone_number: string;
  email?: string | null;
  address?: Address | null;
  emergency_contact?: EmergencyContact | null;
  medical_notes?: string | null;
  allergies: string[];
  blood_group?: BloodGroup | null;
  created_at: string;
  updated_at: string;
}

export interface PatientFormValues {
  first_name: string;
  last_name: string;
  date_of_birth: Date | null;
  gender: Gender | "";
  phone_number: string;
  email: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  emergency_contact: {
    name: string;
    relationship: string;
    phone_number: string;
  };
  medical_notes: string;
  allergies: string;
  blood_group: BloodGroup | "";
}

export type PatientListResponse = Paginated<Patient>;

export interface PatientListParams {
  search?: string;
  page?: number;
  limit?: number;
}
