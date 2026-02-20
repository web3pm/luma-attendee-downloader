import type { LumaAttendee } from "../shared/types";
import { downloadCsv } from "../shared/csv";

const startBtn = document.getElementById("start") as HTMLButtonElement;
const downloadBtn = document.getElementById("download") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLDivElement;

let lastAttendees: LumaAttendee[] = [];

function setStatus(text: string): void {
  statusEl.textContent = text;
}

function setDownloading(active: boolean): void {
  startBtn.disabled = active;
  if (!active && lastAttendees.length > 0) downloadBtn.disabled = false;
}

startBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    setStatus("No active tab.");
    return;
  }
  const isLuma =
    tab.url?.startsWith("https://lu.ma/") ||
    tab.url?.startsWith("https://luma.com/");
  if (!isLuma) {
    setStatus("Open a Luma event page (lu.ma or luma.com) first.");
    return;
  }
  setStatus("Downloading…");
  setDownloading(true);
  downloadBtn.disabled = true;
  const listener = (msg: {
    type: string;
    parsed?: number;
    total?: number;
    attendees?: LumaAttendee[];
    message?: string;
  }) => {
    if (msg.type === "PROGRESS" && msg.parsed != null && msg.total != null) {
      setStatus(`Parsed ${msg.parsed} / ${msg.total} attendees.`);
    }
  };
  chrome.runtime.onMessage.addListener(listener);
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "START_DOWNLOAD",
    });
    chrome.runtime.onMessage.removeListener(listener);
    if (response?.type === "DONE" && Array.isArray(response.attendees)) {
      lastAttendees = response.attendees;
      if (lastAttendees.length === 0) {
        setStatus(
          "No attendees found. Open the attendees list on the page first, then Start download.",
        );
      } else {
        setStatus(
          `Done. ${lastAttendees.length} attendees. Click Download CSV.`,
        );
        downloadBtn.disabled = false;
      }
    } else if (response?.type === "ERROR") {
      setStatus("Error: " + (response.message ?? "Unknown"));
    } else {
      setStatus("No response. Reload the Luma page and try again.");
    }
  } catch (e) {
    chrome.runtime.onMessage.removeListener(listener);
    setStatus(
      "Error: " +
        (e instanceof Error
          ? e.message
          : "Reload the Luma page and try again."),
    );
  }
  setDownloading(false);
});

downloadBtn.addEventListener("click", () => {
  if (lastAttendees.length === 0) return;
  const slug =
    lastAttendees[0]?.sourceEventUrl
      ?.match(/(?:lu\.ma|luma\.com)\/[^/?#]+/)?.[0]
      ?.replace(/\./g, "-") ?? "event";
  downloadCsv(lastAttendees, `luma-attendees-${slug}-${Date.now()}.csv`);
});
