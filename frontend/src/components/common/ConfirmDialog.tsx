import { Button, Group, Modal, Text } from "@mantine/core";

interface ConfirmDialogProps {
  opened: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  opened,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading,
  danger,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="sm">
      <Text size="sm" mb="lg">
        {message}
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          color={danger ? "red" : undefined}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}
