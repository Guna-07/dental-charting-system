import { useEffect } from "react";
import { Group, SegmentedControl, Text } from "@mantine/core";

import {
  MAX_PRIMARY_DENTITION_AGE,
  primaryDentitionAllowed,
  type Dentition,
} from "@/constants/dental/teeth";

interface DentitionToggleProps {
  value: Dentition;
  onChange: (value: Dentition) => void;
  /** Patient age — Primary is disabled above MAX_PRIMARY_DENTITION_AGE. */
  patientAge?: number | null;
}

/**
 * Permanent / Primary switch shared by the Dental Investigation and Surface
 * charts. Primary dentition is only offered for children (see
 * `primaryDentitionAllowed`); above the cutoff the option is disabled and the
 * value is forced back to Permanent.
 */
export function DentitionToggle({
  value,
  onChange,
  patientAge,
}: DentitionToggleProps) {
  const primaryOk = primaryDentitionAllowed(patientAge);

  useEffect(() => {
    if (!primaryOk && value === "primary") onChange("permanent");
  }, [primaryOk, value, onChange]);

  return (
    <Group gap="sm" wrap="wrap">
      <SegmentedControl
        value={primaryOk ? value : "permanent"}
        onChange={(v) => onChange(v as Dentition)}
        data={[
          { label: "Permanent", value: "permanent" },
          { label: "Primary", value: "primary", disabled: !primaryOk },
        ]}
      />
      {!primaryOk ? (
        <Text size="xs" c="dimmed">
          Primary dentition is only available for patients aged{" "}
          {MAX_PRIMARY_DENTITION_AGE} and under.
        </Text>
      ) : null}
    </Group>
  );
}
