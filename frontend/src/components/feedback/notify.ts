import { notifications } from "@mantine/notifications";

export const notify = {
  success(message: string, title = "Saved") {
    notifications.show({ color: "teal", title, message });
  },
  error(message: string, title = "Something went wrong") {
    notifications.show({ color: "red", title, message });
  },
  info(message: string, title?: string) {
    notifications.show({ color: "blue", title, message });
  },
};
