import { Affix, Button, rem } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

export function AddPatientFab({ onClick }: { onClick: () => void }) {
  return (
    <Affix position={{ bottom: rem(28), right: rem(28) }}>
      <Button
        size="md"
        radius="xl"
        leftSection={<IconPlus size={18} />}
        onClick={onClick}
        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}
      >
        Add Patient
      </Button>
    </Affix>
  );
}
