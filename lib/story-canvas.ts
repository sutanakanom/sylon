// Shared canvas drawing + share/download plumbing for every "make me an IG
// Story image" button on the site (hero capture, per-item share, whole-plan
// board). Centralized so all three draw with the same reliable font-loading
// and share/download fallback instead of three slightly different copies.

import { Item } from "./types";
import { labelFor } from "@/components/StatusStamp";
import { whereText, activitySummary } from "./item-display";

const WIDTH = 1080;
const HEIGHT = 1920;

const INK = "#11110F";
const PAPER = "#F3F0E8";
const ACID = "#D8FF43";
const ORANGE = "#FF6B35";
const MUTED = "#716F68";

async function loadCoreFonts() {
  // document.fonts.ready can hang indefinitely if an unrelated web font on
  // the page never resolves — load only the exact weights/sizes this file
  // draws with, each of which resolves (or rejects) on its own.
  await Promise.all([
    document.fonts.load("800 84px Manrope"),
    document.fonts.load("800 64px Manrope"),
    document.fonts.load("800 44px Manrope"),
    document.fonts.load("700 40px Manrope"),
    document.fonts.load("700 26px Manrope"),
    document.fonts.load("500 28px 'DM Mono'"),
    document.fonts.load("500 22px 'DM Mono'"),
    document.fonts.load("700 22px 'DM Mono'"),
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
) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}

function wrapTextCenter(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

// Single-item card: wordmark, status stamp, title, rough date, where. Used
// by the per-item "Share to IG Story" buttons on trip/manifest pages, and
// by the personal page's carousel capture button when a specific plan is
// showing.
export async function drawItemStoryCard(item: Item): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  await loadCoreFonts();

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, WIDTH - 48, HEIGHT - 48);

  ctx.fillStyle = INK;
  ctx.font = "700 40px Manrope";
  ctx.fillText("SYLON", 80, 140);
  ctx.font = "500 22px 'DM Mono'";
  ctx.fillStyle = MUTED;
  ctx.fillText("SEE YOU LATER (OR NOT)", 80, 175);

  const label = labelFor(item);
  ctx.save();
  ctx.translate(WIDTH - 220, 260);
  ctx.rotate((-8 * Math.PI) / 180);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(0, 0, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ACID;
  ctx.font = "700 26px 'DM Mono'";
  ctx.textAlign = "center";
  wrapTextCenter(ctx, label.toUpperCase(), 0, 0, 200, 30);
  ctx.restore();
  ctx.textAlign = "left";

  ctx.fillStyle = MUTED;
  ctx.font = "500 30px 'DM Mono'";
  ctx.fillText(item.roughDate.toUpperCase(), 80, 420);

  ctx.fillStyle = INK;
  ctx.font = "800 84px Manrope";
  wrapTextLeft(ctx, item.title.toUpperCase(), 80, 520, 900, 88);

  const where = whereText(item);
  if (where) {
    ctx.fillStyle = INK;
    ctx.font = "700 40px Manrope";
    ctx.fillText(where, 80, HEIGHT - 260);
  }

  ctx.fillStyle = MUTED;
  ctx.font = "500 26px 'DM Mono'";
  ctx.fillText("SYLATER.APP", 80, HEIGHT - 100);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

// Overview card: wordmark + title + a simple list of every item. This is
// the site's original whole-atlas share design — kept as-is as a
// placeholder for the carousel's "capture this card" button while the
// board-style image (below) covers the newer "Generate IG Story" button.
export async function drawOverviewStoryCard(displayName: string, items: Item[]): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  await loadCoreFonts();

  const MAX_ITEMS = 6;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, WIDTH - 48, HEIGHT - 48);

  ctx.fillStyle = INK;
  ctx.font = "700 40px Manrope";
  ctx.fillText("SYLON", 80, 150);
  ctx.font = "500 22px 'DM Mono'";
  ctx.fillStyle = MUTED;
  ctx.fillText("SEE YOU LATER (OR NOT)", 80, 185);

  ctx.fillStyle = INK;
  ctx.font = "800 72px Manrope";
  wrapTextLeft(ctx, `${displayName.toUpperCase()}'S PLANS`, 80, 320, 920, 76);

  let y = 480;
  const shown = items.slice(0, MAX_ITEMS);
  shown.forEach((item) => {
    const color = item.kind === "trip" ? ACID : ORANGE;
    ctx.fillStyle = INK;
    ctx.fillRect(80, y - 34, 14, 44);
    ctx.fillStyle = color;
    ctx.font = "700 22px 'DM Mono'";
    ctx.fillText(labelFor(item).toUpperCase(), 114, y - 8);
    ctx.fillStyle = INK;
    ctx.font = "800 44px Manrope";
    wrapTextLeft(ctx, item.title.toUpperCase(), 114, y + 32, 880, 48);
    ctx.fillStyle = MUTED;
    ctx.font = "500 26px 'DM Mono'";
    ctx.fillText(item.roughDate.toUpperCase(), 114, y + 76);
    y += 170;
  });

  if (items.length > MAX_ITEMS) {
    ctx.fillStyle = MUTED;
    ctx.font = "500 26px 'DM Mono'";
    ctx.fillText(`+ ${items.length - MAX_ITEMS} MORE`, 114, y);
  }

  ctx.fillStyle = MUTED;
  ctx.font = "500 26px 'DM Mono'";
  ctx.fillText("SYLATER.APP", 80, HEIGHT - 100);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

// Board card: stacked plain boxes, one per plan, each labelled with its
// status (labelFor — "See you", "Should we see?", etc.) so it reads like a
// boarding board rather than a colorful poster. Used by the "Generate IG
// Story" button under "The whole plan".
export async function drawWholePlanStoryCard(displayName: string, items: Item[]): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  await loadCoreFonts();

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Wordmark
  ctx.fillStyle = ACID;
  ctx.beginPath();
  ctx.arc(90, 92, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = "800 40px Manrope";
  ctx.fillText("SYLON", 122, 108);
  ctx.fillStyle = MUTED;
  ctx.font = "500 21px 'DM Mono'";
  ctx.fillText(`${displayName.toUpperCase()}'S FUTURE ATLAS`, 90, 184);

  // Title
  ctx.fillStyle = INK;
  ctx.font = "800 94px Manrope";
  ctx.fillText("THE WHOLE", 86, 296);
  ctx.fillText("PLAN.", 86, 386);

  const tripCount = items.filter((i) => i.kind === "trip").length;
  const manifestCount = items.filter((i) => i.kind === "manifest").length;
  ctx.fillStyle = MUTED;
  ctx.font = "500 19px 'DM Mono'";
  ctx.fillText(
    `${tripCount} TRIP${tripCount === 1 ? "" : "S"}  /  ${manifestCount} MANIFEST${manifestCount === 1 ? "" : "S"}`,
    90,
    432
  );

  // Plain stacked boxes — no color-coding, just a clear status label per row
  const x = 80;
  const w = 920;
  const h = 172;
  const gap = 20;
  const startY = 488;
  const MAX_ITEMS = 6;
  const shown = items.slice(0, MAX_ITEMS);

  shown.forEach((item, i) => {
    const y = startY + i * (h + gap);
    ctx.fillStyle = PAPER;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = MUTED;
    ctx.font = "500 18px 'DM Mono'";
    ctx.fillText(String(i + 1).padStart(2, "0"), x + 24, y + 38);

    ctx.fillStyle = INK;
    ctx.font = "700 17px 'DM Mono'";
    ctx.fillText(`${labelFor(item).toUpperCase()} · ${item.roughDate.toUpperCase()}`, x + 92, y + 38);

    ctx.fillStyle = INK;
    ctx.font = "800 43px Manrope";
    wrapTextLeft(ctx, item.title.toUpperCase(), x + 92, y + 88, w - 180, 46);

    // whereText() already includes vote counts for a manifest, so only
    // append the activity summary for a trip (member count) to avoid
    // repeating "· N votes" twice.
    const footLine = item.kind === "trip" ? `${whereText(item)} · ${activitySummary(item)}` : whereText(item);
    ctx.fillStyle = MUTED;
    ctx.font = "500 17px 'DM Mono'";
    ctx.fillText(footLine.toUpperCase(), x + 92, y + 140);

    ctx.fillStyle = INK;
    ctx.font = "500 40px Manrope";
    ctx.fillText("↗", x + w - 62, y + 92);
  });

  if (items.length > MAX_ITEMS) {
    ctx.fillStyle = MUTED;
    ctx.font = "500 19px 'DM Mono'";
    ctx.fillText(`+ ${items.length - MAX_ITEMS} MORE`, x + 24, startY + shown.length * (h + gap) + 30);
  }

  ctx.fillStyle = MUTED;
  ctx.font = "500 19px 'DM Mono'";
  ctx.fillText(`@${displayName.toLowerCase()}`, 84, HEIGHT - 175);
  ctx.fillText("SEE YOU LATER — OR NOT.", 84, HEIGHT - 130);
  ctx.fillText("SYLATER.APP", 84, HEIGHT - 80);

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
