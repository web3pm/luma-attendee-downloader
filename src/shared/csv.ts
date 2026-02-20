import type { LumaAttendee } from "./types";

const CSV_COLUMNS: (keyof LumaAttendee)[] = [
  "userId",
  "profileUrl",
  "name",
  "displayNameRaw",
  "avatarUrl",
  "x",
  "instagram",
  "sourceEventUrl",
  "downloadedAt",
];

function escapeCsvCell(value: string | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (
    s.includes(",") ||
    s.includes('"') ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function attendeesToCsv(attendees: LumaAttendee[]): string {
  const header = CSV_COLUMNS.join(",");
  const rows = attendees.map((a) =>
    CSV_COLUMNS.map((col) => {
      const val = a[col];
      return escapeCsvCell(
        val == null ? "" : typeof val === "string" ? val : "",
      );
    }).join(","),
  );
  return [header, ...rows].join("\r\n");
}

export function downloadCsv(
  attendees: LumaAttendee[],
  filename?: string,
): void {
  const csv = attendeesToCsv(attendees);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `luma-attendees-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
