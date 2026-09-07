import Link from "next/link";
import { ActionIcon, Group, Text, useMantineColorScheme } from "@mantine/core";
import { IconDental, IconMoon, IconSun } from "@tabler/icons-react";

import { APP_NAME } from "@/constants";
import { routes } from "@/app/router/routes";

export function Header() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group h="100%" px="md" justify="space-between">
      <Link
        href={routes.patients()}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Group gap="xs">
          <IconDental size={26} />
          <Text fw={700} size="lg">
            {APP_NAME}
          </Text>
        </Group>
      </Link>
      <ActionIcon
        variant="default"
        size="lg"
        onClick={toggleColorScheme}
        aria-label="Toggle colour scheme"
      >
        {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Group>
  );
}
