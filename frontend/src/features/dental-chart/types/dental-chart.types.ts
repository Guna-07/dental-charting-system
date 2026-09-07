import type {
  FindingStatus,
  InvestigationFindingType,
} from "@/constants/dental/findings";
import type { Dentition } from "@/constants/dental/teeth";

export interface ToothFinding {
  id: string;
  type: InvestigationFindingType;
  status: FindingStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ToothInvestigation {
  tooth_number: string;
  dentition: Dentition;
  findings: ToothFinding[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface DentalChart {
  patient_id: string;
  teeth: Record<string, ToothInvestigation>;
  created_at: string;
  updated_at: string;
}

/** Payload for PUT .../dental-chart/teeth/{tooth} */
export interface ToothInvestigationInput {
  dentition?: Dentition;
  notes: string;
  findings: Array<{
    id?: string;
    type: InvestigationFindingType;
    status: FindingStatus;
    notes: string;
  }>;
}
