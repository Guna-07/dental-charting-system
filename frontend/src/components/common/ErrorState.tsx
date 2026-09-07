import { Alert, Button, Center, Stack } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

import { ApiError } from "@/types/api.types";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

function messageOf(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Center mih={220}>
      <Stack align="center" gap="sm" maw={420}>
        <Alert
          icon={<IconAlertTriangle size={18} />}
          color="red"
          variant="light"
          title="Could not load data"
          w="100%"
        >
          {messageOf(error)}
        </Alert>
        {onRetry ? (
          <Button variant="default" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </Stack>
    </Center>
  );
}
