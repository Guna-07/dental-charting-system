import dayjs from "dayjs";

export function fullName(first: string, last: string): string {
  return `${first} ${last}`.trim();
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("DD MMM YYYY") : "—";
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("DD MMM YYYY, HH:mm") : "—";
}

export function titleCase(value: string): string {
  return value
    .split(/[\s_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}
