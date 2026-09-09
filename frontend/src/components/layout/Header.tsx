import Link from "next/link";
import { ActionIcon, Group, Text, useMantineColorScheme } from "@mantine/core";
import { IconDental, IconMoon, IconSun } from "@tabler/icons-react";

import { APP_NAME } from "@/constants";
import { routes } from "@/app/router/routes";

export function Header() {
  const { toggleColorScheme } = useMantineColorScheme();

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
        {/* Both icons are always rendered; CSS shows one based on the
            `data-mantine-color-scheme` attribute the ColorSchemeScript sets on
            <html>. Rendering conditionally on `colorScheme` here would produce a
            server/client hydration mismatch when dark mode is persisted. */}
        <IconMoon size={18} className="scheme-icon scheme-icon--light" />
        <IconSun size={18} className="scheme-icon scheme-icon--dark" />
      </ActionIcon>
    </Group>
  );
}
