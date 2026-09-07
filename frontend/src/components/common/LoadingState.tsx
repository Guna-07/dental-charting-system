import { Center, Loader, Stack, Text } from "@mantine/core";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <Center mih={200} role="status" aria-live="polite">
      <Stack align="center" gap="xs">
        <Loader />
        <Text c="dimmed" size="sm">
          {label}
        </Text>
      </Stack>
    </Center>
  );
}
