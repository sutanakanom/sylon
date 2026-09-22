// Shared canvas drawing + share/download plumbing for every "make me an IG
// Story image" button on the site (per-item share on a trip/manifest page,
// the personal page's per-card capture, and the personal page's whole-plan
// card). Centralized so all three draw with the same reliable font-loading
// and share/download fallback instead of separate copies.
//
// Card copy is generated from real fields only — no invented per-item
// text, no new DB columns. The one piece of editorial flavor (the
// "SIGNED UP FOR A 10K..." style line) reuses the existing noteQuote
// field and is simply omitted when that field is empty.

import { Item, Trip, Manifest } from "./types";
import { routeText } from "./item-display";

const WIDTH = 1080;
const HEIGHT = 1920;

const INK = "#11110F";
const PAPER = "#F3F0E8";
const ACID = "#D8FF43";
const ORANGE = "#FF6B35";
const MUTED = "#716F68";

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

async function loadCoreFonts() {
  // document.fonts.ready can hang indefinitely if an unrelated web font on
  // the page never resolves — load only the exact weights this file draws
  // with (sizes don't matter for face-loading), each of which resolves
  // (or rejects) on its own.
  await Promise.all([
    document.fonts.load("800 64px Manrope"),
    document.fonts.load("700 40px Manrope"),
    document.fonts.load("500 28px 'DM Mono'"),
    document.fonts.load("700 28px 'DM Mono'"),
  ]).catch(() => {
    // Missing/blocked font — draw with whatever the browser falls back to
    // rather than hanging the button forever.
  });
}

function wrapTextLeft(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  let lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
      lines++;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cy);
    lines++;
  }
  return lines;
}

// --- Small parsing helpers — pull a month/year out of free-text fields
// (roughDate, e.g. "Late Nov – early Dec", "9 Dec", "2028") so the
// headline can stay data-driven without adding new fields. -------------

function parseMonthLabel(text: string): string | null {
  const lower = text.toLowerCase();
  for (let i = 0; i < FULL_MONTHS.length; i++) {
    const full = FULL_MONTHS[i].toLowerCase();
    const abbr = full.slice(0, 3);
    if (lower.includes(full) || new RegExp(`\\b${abbr}\\b`).test(lower)) {
      return FULL_MONTHS[i];
    }
  }
  return null;
}

function parseYear(text: string): string | null {
  const match = text.match(/(20\d{2})/);
  return match ? match[1] : null;
}

// Truncates to one line with an ellipsis instead of wrapping — used inside
// the whole-plan card's fixed-height boxes, where a wrapped second line
// would run past the box border.
function truncateToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
}

function formatShortDay(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  if (!month || !day) return iso;
  return `${String(day).padStart(2, "0")} ${FULL_MONTHS[month - 1].slice(0, 3).toUpperCase()}`;
}

// --- Trip-specific copy --------------------------------------------------

function tripMonthWord(item: Trip): string {
  if (item.legs.length > 0) {
    const earliest = item.legs.map((l) => l.startDate).sort()[0];
    const month = Number(earliest.slice(5, 7));
    if (month >= 1 && month <= 12) return FULL_MONTHS[month - 1].toUpperCase();
  }
  const found = parseMonthLabel(item.roughDate);
  if (found) return found.toUpperCase();
  return item.roughDate.toUpperCase();
}

function tripYear(item: Trip): string {
  if (item.legs.length > 0) {
    const earliest = item.legs.map((l) => l.startDate).sort()[0];
    const year = earliest.slice(0, 4);
    if (year) return year;
  }
  return parseYear(item.roughDate) ?? String(new Date().getFullYear());
}

function tripDateRangeShort(item: Trip): string {
  if (item.legs.length === 0) return item.roughDate.toUpperCase();
  const starts = item.legs.map((l) => l.startDate).sort();
  const ends = item.legs.map((l) => l.endDate).sort();
  const start = starts[0];
  const end = ends[ends.length - 1];
  if (start === end) return formatShortDay(start);
  return `${formatShortDay(start)} — ${formatShortDay(end)}`;
}

function tripBadgeLines(item: Trip): [string, string] {
  switch (item.status) {
    case "confirmed":
      return ["ACTUALLY", "HAPPENING"];
    case "planning":
      return ["MAYBE", "HAPPENING"];
    case "completed":
      return ["ALREADY", "HAPPENED"];
    case "cancelled":
      return ["NOT", "HAPPENING"];
    default:
      return ["HAPPENING", ""];
  }
}

// --- Manifest-specific copy ----------------------------------------------

function manifestYear(item: Manifest): string {
  if (item.targetStartDate) return item.targetStartDate.slice(0, 4);
  return parseYear(item.roughDate) ?? String(new Date().getFullYear());
}

function manifestSubtitleLine(item: Manifest): string {
  return (item.purpose || item.roughDate).toUpperCase();
}

function manifestLocationLine(item: Manifest): string {
  if (item.decidedCountry) return item.decidedCountry.toUpperCase();
  const total = item.countryVotes.reduce((sum, v) => sum + v.votes, 0);
  if (total > 0) {
    const leader = item.countryVotes.slice().sort((a, b) => b.votes - a.votes)[0];
    return `${leader.country.toUpperCase()} LEADING`;
  }
  if (item.countryVotes.length > 0) {
    return item.countryVotes.map((v) => v.country.toUpperCase()).join(" OR ");
  }
  return "LOCATION OPEN";
}

function manifestBadgeLines(item: Manifest): [string, string] {
  switch (item.status) {
    case "open":
      return ["CURRENTLY", "MANIFESTING"];
    case "converted":
      return ["BECAME", "A TRIP"];
    case "dropped":
      return ["NOT", "MANIFESTING"];
    default:
      return ["MANIFESTING", ""];
  }
}

// --- Shared drawing pieces -------------------------------------------------

function drawHeader(ctx: CanvasRenderingContext2D, metaRight: string) {
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.font = "800 40px Manrope";
  ctx.fillText("SYLON", 80, 118);

  ctx.font = "600 22px 'DM Mono'";
  ctx.textAlign = "right";
  ctx.fillText(metaRight, 1000, 112);
  ctx.textAlign = "left";
}

function drawHighlightBar(ctx: CanvasRenderingContext2D, color: string, text: string, x: number, y: number) {
  const width = ctx.measureText(text).width;
  ctx.save();
  ctx.translate(x - 8, y - 66);
  ctx.rotate((-1.5 * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width + 44, 74);
  ctx.restore();
}

function drawBadgeCircle(
  ctx: CanvasRenderingContext2D,
  color: string,
  lines: [string, string],
  x: number,
  y: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-8 * Math.PI) / 180);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(0, 0, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = "700 30px 'DM Mono'";
  ctx.textAlign = "center";
  const filtered = lines.filter(Boolean);
  const startY = filtered.length === 1 ? 10 : -8;
  filtered.forEach((l, i) => ctx.fillText(l, 0, startY + i * 36));
  ctx.restore();
  ctx.textAlign = "left";
}

function drawTape(ctx: CanvasRenderingContext2D, color: string, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-4 * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 240, 56);
  ctx.restore();
}

function drawFlavorLine(ctx: CanvasRenderingContext2D, quote: string | null, x: number, y: number) {
  if (!quote) return;
  ctx.fillStyle = INK;
  ctx.font = "700 34px 'DM Mono'";
  wrapTextLeft(ctx, quote.toUpperCase(), x, y, 900, 44);
}

function drawFooter(ctx: CanvasRenderingContext2D, handle: string) {
  ctx.fillStyle = MUTED;
  ctx.font = "500 26px 'DM Mono'";
  ctx.textAlign = "left";
  ctx.fillText(`@${handle.toUpperCase()}`, 80, HEIGHT - 100);
  ctx.textAlign = "right";
  ctx.fillText("SYLATER.APP", 1000, HEIGHT - 100);
  ctx.textAlign = "left";
}

// --- Trip card -------------------------------------------------------------

async function drawTripStoryCard(item: Trip): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  await loadCoreFonts();

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawHeader(ctx, `${item.status.toUpperCase()} TRIP / ${tripYear(item)}`);

  const x = 80;
  const headlineY = 340;
  const line1 = `${tripMonthWord(item)} IS`;

  ctx.font = "800 88px Manrope";
  drawHighlightBar(ctx, ORANGE, line1, x, headlineY);

  ctx.fillStyle = INK;
  ctx.font = "800 88px Manrope";
  ctx.fillText(line1, x, headlineY);
  ctx.fillText("BOOKED", x, headlineY + 96);
  ctx.fillText("& BUSY", x, headlineY + 192);

  drawBadgeCircle(ctx, ACID, tripBadgeLines(item), 880, headlineY + 150);

  let y = headlineY + 340;
  ctx.fillStyle = MUTED;
  ctx.font = "500 30px 'DM Mono'";
  ctx.fillText(tripDateRangeShort(item), x, y);

  y += 70;
  ctx.fillStyle = INK;
  ctx.font = "800 64px Manrope";
  const titleLines = wrapTextLeft(ctx, item.title.toUpperCase(), x, y, 900, 68);
  y += 32 + titleLines * 68;

  ctx.fillStyle = MUTED;
  ctx.font = "700 30px 'DM Mono'";
  ctx.fillText(routeText(item).toUpperCase(), x, y);

  drawTape(ctx, ORANGE, x - 10, y + 260);
  drawFlavorLine(ctx, item.noteQuote, x, y + 430);
  drawFooter(ctx, item.ownerHandle);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

// --- Manifest card -----------------------------------------------------

async function drawManifestStoryCard(item: Manifest): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  await loadCoreFonts();

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawHeader(ctx, `${item.status.toUpperCase()} MANIFEST / ${manifestYear(item)}`);

  const x = 80;
  const headlineY = 340;
  const line1 = `${manifestYear(item)} ME IS`;

  ctx.font = "800 88px Manrope";
  drawHighlightBar(ctx, ACID, line1, x, headlineY);

  ctx.fillStyle = INK;
  ctx.font = "800 88px Manrope";
  ctx.fillText(line1, x, headlineY);
  ctx.fillText("CALLING", x, headlineY + 96);
  ctx.fillText("THIS IN", x, headlineY + 192);

  drawBadgeCircle(ctx, ORANGE, manifestBadgeLines(item), 880, headlineY + 150);

  let y = headlineY + 340;
  ctx.fillStyle = MUTED;
  ctx.font = "500 30px 'DM Mono'";
  ctx.fillText(manifestSubtitleLine(item), x, y);

  y += 70;
  ctx.fillStyle = INK;
  ctx.font = "800 64px Manrope";
  const titleLines = wrapTextLeft(ctx, item.title.toUpperCase(), x, y, 900, 68);
  y += 32 + titleLines * 68;

  ctx.fillStyle = MUTED;
  ctx.font = "700 30px 'DM Mono'";
  ctx.fillText(manifestLocationLine(item), x, y);

  drawTape(ctx, ACID, x - 10, y + 260);
  drawFlavorLine(ctx, item.noteQuote, x, y + 430);
  drawFooter(ctx, item.ownerHandle);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

// Dispatcher kept so existing call sites (per-item share button, the
// personal page's per-card capture button) don't need to know which kind
// of card they're asking for.
export async function drawItemStoryCard(item: Item): Promise<Blob | null> {
  return item.kind === "trip" ? drawTripStoryCard(item) : drawManifestStoryCard(item);
}

// --- Whole-plan card ---------------------------------------------------
// One scattered, hand-labeled box per public plan (kind · rough date,
// title), stacked with the site's usual hard offset shadow. Also used as
// the personal page's per-card capture fallback when the carousel's
// aggregate "summary" card is the one showing, so there's a single
// aggregate design instead of two different ones.

const TAG_SLOTS: { x: number; y: number; w: number; rot: number; bg: string }[] = [
  { x: 80, y: 940, w: 440, rot: -3, bg: PAPER },
  { x: 560, y: 1052, w: 380, rot: 3, bg: ORANGE },
  { x: 40, y: 1170, w: 580, rot: -2, bg: ACID },
  { x: 610, y: 1290, w: 330, rot: 4, bg: PAPER },
  { x: 120, y: 1408, w: 380, rot: -3, bg: PAPER },
  { x: 540, y: 1526, w: 400, rot: 2, bg: ORANGE },
];

export async function drawWholePlanStoryCard(displayName: string, items: Item[]): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  await loadCoreFonts();

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const years = items
    .map((item) => (item.kind === "trip" ? tripYear(item) : manifestYear(item)))
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const startYear = years.length ? Math.min(...years) : new Date().getFullYear();
  const endYear = years.length ? Math.max(...years) : startYear;
  const yearRange = startYear === endYear ? String(startYear) : `${startYear}–${String(endYear).slice(-2)}`;

  drawHeader(ctx, `FUTURE FILE / ${yearRange}`);

  ctx.fillStyle = INK;
  ctx.font = "800 220px Manrope";
  ctx.fillText(String(items.length), 76, 470);

  const numberWidth = ctx.measureText(String(items.length)).width;
  const headX = 76 + numberWidth + 40;
  ctx.font = "800 76px Manrope";
  ctx.fillText("PLANS.", headX, 320);
  ctx.fillText("ZERO", headX, 396);
  ctx.fillText("CHILL.", headX, 472);

  ctx.font = "800 46px Manrope";
  ctx.fillText("MY FUTURE IS ALREADY", 80, 590);

  ctx.font = "800 74px Manrope";
  const tagline = "BOOKED & BUSY.";
  drawHighlightBar(ctx, ACID, tagline, 80, 730);
  ctx.fillStyle = INK;
  ctx.fillText(tagline, 80, 730);

  const shown = items.slice(0, TAG_SLOTS.length);
  shown.forEach((item, i) => {
    const slot = TAG_SLOTS[i];
    const h = 112;
    ctx.save();
    ctx.translate(slot.x, slot.y);
    ctx.rotate((slot.rot * Math.PI) / 180);

    // Hard offset shadow, matching the site's own hover-shadow style.
    ctx.fillStyle = INK;
    ctx.fillRect(6, 6, slot.w, h);

    ctx.fillStyle = slot.bg;
    ctx.fillRect(0, 0, slot.w, h);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, slot.w, h);

    const kind = item.kind === "trip" ? "TRIP" : "MANIFEST";
    const dateLabel = item.kind === "trip" ? tripDateRangeShort(item) : item.roughDate.toUpperCase();
    ctx.fillStyle = MUTED;
    ctx.font = "700 18px 'DM Mono'";
    ctx.fillText(`${kind} · ${dateLabel}`, 24, 38);

    ctx.fillStyle = INK;
    ctx.font = "800 40px Manrope";
    ctx.fillText(truncateToWidth(ctx, item.title.toUpperCase(), slot.w - 70), 24, 84);

    ctx.font = "500 40px Manrope";
    ctx.fillText("↗", slot.w - 52, 64);

    ctx.restore();
  });

  if (items.length > TAG_SLOTS.length) {
    const last = TAG_SLOTS[TAG_SLOTS.length - 1];
    ctx.fillStyle = MUTED;
    ctx.font = "500 24px 'DM Mono'";
    ctx.fillText(`+ ${items.length - TAG_SLOTS.length} MORE`, last.x, last.y + 170);
  }

  drawFooter(ctx, displayName);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

export type ShareOutcome = "shared" | "downloaded" | "cancelled" | "failed";

// Hands the drawn image to the OS share sheet (which lists Instagram as a
// target) when available, otherwise downloads it. The anchor is appended
// to the document before clicking and removed after — Safari and Firefox
// can silently no-op a synthetic click on a detached element.
export async function shareOrDownloadImage(
  blob: Blob | null,
  filename: string,
  shareTitle: string
): Promise<ShareOutcome> {
  if (!blob) return "failed";

  const file = new File([blob], filename, { type: "image/png" });

  if (
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: shareTitle });
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "cancelled";
      // fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return "downloaded";
}
