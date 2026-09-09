import { useState, type RefObject } from "react";
import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { toPng } from "html-to-image";

import { notify } from "@/components/feedback/notify";

interface DownloadImageButtonProps {
  /** Element to capture. */
  targetRef: RefObject<HTMLElement>;
  /** File name without extension. */
  filename: string;
  label?: string;
}

function bodyBackground(): string {
  if (typeof window === "undefined") return "#ffffff";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--mantine-color-body")
    .trim();
  return v || getComputedStyle(document.body).backgroundColor || "#ffffff";
}

export function DownloadImageButton({
  targetRef,
  filename,
  label = "Download image",
}: DownloadImageButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    const node = targetRef.current;
    if (!node) return;
    setBusy(true);
    // Let horizontally-scrolling regions expand and per-chart export tweaks
    // apply, then wait a frame so layout reflows before we measure/capture.
    node.setAttribute("data-exporting", "");
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: bodyBackground(),
      });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : "Could not export the image",
        "Download failed",
      );
    } finally {
      node.removeAttribute("data-exporting");
      setBusy(false);
    }
  };

  return (
    <Button
      variant="default"
      size="compact-sm"
      leftSection={<IconDownload size={16} />}
      loading={busy}
      onClick={handleDownload}
    >
      {label}
    </Button>
  );
}
