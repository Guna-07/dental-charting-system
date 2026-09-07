import { Fragment, type ReactNode } from "react";
import { Box, Text } from "@mantine/core";

import {
  archTeeth,
  midlineIndex,
  type ArchName,
  type Dentition,
} from "@/constants/dental/teeth";

interface ArchRowProps {
  dentition: Dentition;
  arch: ArchName;
  /** Render a single tooth cell for the given FDI number. */
  renderTooth: (toothNumber: string) => ReactNode;
  /** Put the FDI number labels above the teeth (used for the lower arch). */
  numbersOnTop?: boolean;
  gap?: number;
}

export function ArchRow({
  dentition,
  arch,
  renderTooth,
  numbersOnTop = false,
  gap = 4,
}: ArchRowProps) {
  const teeth = archTeeth(dentition, arch);
  const mid = midlineIndex(dentition);

  return (
    <Box
      style={{
        display: "flex",
        gap,
        alignItems: "flex-start",
        justifyContent: "center",
        flexWrap: "nowrap",
        overflowX: "auto",
      }}
    >
      {teeth.map((tooth, index) => (
        <Fragment key={tooth}>
          {index === mid ? <Box w={gap * 4} style={{ flexShrink: 0 }} /> : null}
          <Box
            style={{
              display: "flex",
              flexDirection: numbersOnTop ? "column-reverse" : "column",
              alignItems: "center",
              gap: 2,
              flexShrink: 0,
            }}
          >
            {renderTooth(tooth)}
            <Text size="10px" c="dimmed" ff="monospace">
              {tooth}
            </Text>
          </Box>
        </Fragment>
      ))}
    </Box>
  );
}
