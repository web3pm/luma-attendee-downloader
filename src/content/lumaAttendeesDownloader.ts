import type { LumaAttendee } from "../shared/types";
import { createEmptyAttendee, SOCIAL_HOST_MAP } from "../shared/types";

const SCROLL_PAUSE_MS = 800;
const MAX_STABLE_ROUNDS = 3;

function getUserIdFromHref(href: string): string {
  const path = href.startsWith("http") ? new URL(href).pathname : href;
  const m = path.match(/\/user\/([^/?#]+)/);
  return m ? m[1] : "";
}

function getProfileUrl(link: HTMLAnchorElement): string {
  const href = link.getAttribute("href") ?? "";
  if (href.startsWith("http")) return href;
  const origin = window.location.origin;
  return origin + (href.startsWith("/") ? href : "/" + href);
}

function socialKeyFromUrl(url: string): keyof LumaAttendee | null {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return SOCIAL_HOST_MAP[host] ?? null;
  } catch {
    return null;
  }
}

const PROFILE_LINK_SELECTOR =
  'a[href^="/user/"], a[href*="luma.com/user/"], a[href*="lu.ma/user/"]';

function parseCard(block: Element, sourceEventUrl: string): LumaAttendee {
  const a = block.querySelector<HTMLAnchorElement>(PROFILE_LINK_SELECTOR);
  const attendee = createEmptyAttendee(sourceEventUrl);
  if (!a) return attendee;

  const href = a.getAttribute("href") ?? "";
  attendee.userId = getUserIdFromHref(href);
  attendee.profileUrl = getProfileUrl(a);

  const nameEl = block.querySelector(".name");
  const raw = (nameEl?.textContent ?? a.textContent ?? "").trim();
  attendee.displayNameRaw = raw;
  if (raw) {
    const paren = raw.indexOf(" (");
    attendee.name = paren > 0 ? raw.slice(0, paren).trim() : raw;
    if (paren > 0)
      attendee.extra.socialHandleHint = raw
        .slice(paren + 2)
        .replace(/\)$/, "")
        .trim();
  }

  const img = block.querySelector("img");
  if (img) attendee.avatarUrl = img.getAttribute("src") ?? null;

  const socialLinks =
    block.querySelectorAll<HTMLAnchorElement>('a[href^="http"]');
  socialLinks.forEach((link) => {
    const url = link.getAttribute("href") ?? "";
    const key = socialKeyFromUrl(url);
    if (key) (attendee as unknown as Record<string, string | null>)[key] = url;
  });

  return attendee;
}

function findAttendeeBlocks(): Element[] {
  const profileLinks = document.querySelectorAll<HTMLAnchorElement>(
    PROFILE_LINK_SELECTOR,
  );
  const seen = new Set<string>();
  const blocks: Element[] = [];
  profileLinks.forEach((link) => {
    const href = (link.getAttribute("href") ?? "").split("?")[0];
    const norm = href.replace(/^https?:\/\/[^/]+/, "");
    if (seen.has(norm)) return;
    seen.add(norm);
    const block = link.closest("div");
    if (block) blocks.push(block);
  });
  return blocks;
}

function getModalScrollContainer(): Element | null {
  const modal = document.querySelector('.lux-modal, [class*="lux-modal"]');
  if (!modal) return null;
  const withOverflow = modal.querySelector(
    '[style*="overflow"], [class*="outer"]',
  );
  if (
    withOverflow &&
    withOverflow.scrollHeight > (withOverflow as HTMLElement).clientHeight
  )
    return withOverflow;
  let el: HTMLElement | null = modal as HTMLElement;
  while (el) {
    const style = getComputedStyle(el);
    const overflowY = style.overflowY || style.overflow;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight
    )
      return el;
    el = el.parentElement;
  }
  return modal;
}

function scrollToEnd(): void {
  const modalScroll = getModalScrollContainer();
  if (modalScroll) {
    (modalScroll as HTMLElement).scrollTop = (
      modalScroll as HTMLElement
    ).scrollHeight;
    return;
  }
  window.scrollTo(0, document.documentElement.scrollHeight);
}

async function runDownloader(
  onProgress: (parsed: number, total: number) => void,
): Promise<LumaAttendee[]> {
  const sourceEventUrl = window.location.href;
  const seen = new Set<string>();
  let stableRounds = 0;
  let lastCount = 0;

  while (stableRounds < MAX_STABLE_ROUNDS) {
    scrollToEnd();
    await new Promise((r) => setTimeout(r, SCROLL_PAUSE_MS));
    const blocks = findAttendeeBlocks();
    if (blocks.length === lastCount) stableRounds++;
    else stableRounds = 0;
    lastCount = blocks.length;
  }

  const attendees: LumaAttendee[] = [];
  const blocks = findAttendeeBlocks();
  onProgress(0, blocks.length);
  for (let i = 0; i < blocks.length; i++) {
    const rec = parseCard(blocks[i], sourceEventUrl);
    const key = rec.userId || rec.profileUrl;
    if (key && !seen.has(key)) {
      seen.add(key);
      attendees.push(rec);
    }
    if ((i + 1) % 10 === 0 || i === blocks.length - 1) {
      onProgress(attendees.length, blocks.length);
    }
  }
  return attendees;
}

chrome.runtime.onMessage.addListener(
  (
    msg: { type: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (r: unknown) => void,
  ) => {
    if (msg.type !== "START_DOWNLOAD") return;
    runDownloader((parsed, total) => {
      chrome.runtime
        .sendMessage({ type: "PROGRESS", parsed, total })
        .catch(() => {});
    })
      .then((attendees) => sendResponse({ type: "DONE", attendees }))
      .catch((err) => sendResponse({ type: "ERROR", message: String(err) }));
    return true;
  },
);
