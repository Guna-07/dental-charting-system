import type { ReactNode } from "react";
import { Button, Center, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Center mih={220}>
      <Stack align="center" gap="sm" maw={360} ta="center">
        <ThemeIcon variant="light" size={56} radius="xl" color="gray">
          {icon ?? <IconInbox size={28} />}
        </ThemeIcon>
        <Title order={4}>{title}</Title>
        {description ? (
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        ) : null}
        {action ? (
          <Button onClick={action.onClick} mt="xs">
            {action.label}
          </Button>
        ) : null}
      </Stack>
    </Center>
  );
}
