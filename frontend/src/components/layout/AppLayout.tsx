import type { ReactNode } from "react";
import { AppShell, Container } from "@mantine/core";

import { Header } from "./Header";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <AppShell.Main>
        <Container size="xl" px={0}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
