import dayjs from "dayjs";

export function formatDate(value?: string | null) {
  return value ? dayjs(value).format("YYYY-MM-DD") : "-";
}

export function formatDateTime(value?: string | null) {
  return value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-";
}

export function formatPoints(value?: number | null) {
  if (value === null || value === undefined) {
    return "--";
  }
  return `${value} 滴`;
}
