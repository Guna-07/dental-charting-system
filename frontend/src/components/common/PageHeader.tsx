import type { ReactNode } from "react";
import { Group, Stack, Text, Title } from "@mantine/core";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap" mb="lg">
      <Stack gap={2}>
        <Title order={2}>{title}</Title>
        {subtitle ? (
          <Text c="dimmed" size="sm">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
      {actions ? <Group gap="sm">{actions}</Group> : null}
    </Group>
  );
}
