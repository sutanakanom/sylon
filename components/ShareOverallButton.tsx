"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { labelFor } from "./StatusStamp";
import { whereText } from "@/lib/item-display";

// The personal page's "Generate IG Story" button — a 1080x1920 board-style
// summary of every public plan, matching the board section's own banner
// look. Rough info only, same as the per-item card (titles + rough dates —
// no exact dates, no member names). Uses labelFor() for status text, same
// as every other status badge on the site.

const WIDTH = 1080;
const HEIGHT = 1920;
const MAX_ITEMS = 6;
const ROW_COLORS: { bg: string; fg: string }[] = [
  { bg: "#11110f", fg: "#f3f0e8" },
  { bg: "#d8ff43", fg: "#11110f" },
  { bg: "#ff6b35", fg: "#11110f" },
  { bg: "#f3f0e8", fg: "#11110f" },
];

function storyText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  weight = "500",
  color = "#11110f",
  family = "Manrope"
) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillText(text, x, y);
}

async function drawWholePlanCard(displayName: string, items: Item[]): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  await document.fonts.ready;

  const ink = "#11110f";
  const paper = "#f3f0e8";
  const acid = "#d8ff43";
  const muted = "#716f68";

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Wordmark
  ctx.fillStyle = acid;
  ctx.beginPath();
  ctx.arc(90, 92, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.stroke();
  storyText(ctx, "SYLON", 122, 108, 40, "800");
  storyText(ctx, `${displayName.toUpperCase()}'S FUTURE ATLAS`, 90, 184, 21, "500", muted, "'DM Mono'");

  // Title
  storyText(ctx, "THE WHOLE", 86, 296, 94, "800");
  storyText(ctx, "PLAN.", 86, 386, 94, "800");

  const tripCount = items.filter((i) => i.kind === "trip").length;
  const manifestCount = items.filter((i) => i.kind === "manifest").length;
  storyText(
    ctx,
    `${tripCount} TRIP${tripCount === 1 ? "" : "S"}  /  ${manifestCount} MANIFEST${manifestCount === 1 ? "" : "S"}`,
    90,
    432,
    19,
    "500",
    muted,
    "'DM Mono'"
  );

  // Rows
  const x = 80;
  const w = 920;
  const h = 172;
  const gap = 20;
  const startY = 488;
  const shown = items.slice(0, MAX_ITEMS);
  shown.forEach((item, i) => {
    const color = ROW_COLORS[i % ROW_COLORS.length];
    const y = startY + i * (h + gap);
    ctx.fillStyle = color.bg;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
    storyText(ctx, String(i + 1).padStart(2, "0"), x + 24, y + 38, 18, "500", color.fg, "'DM Mono'");
    storyText(ctx, `${labelFor(item)} · ${item.roughDate}`.toUpperCase(), x + 92, y + 38, 17, "500", color.fg, "'DM Mono'");
    storyText(ctx, item.title.toUpperCase(), x + 92, y + 101, 43, "800", color.fg);
    storyText(ctx, whereText(item).toUpperCase(), x + 92, y + 140, 17, "500", color.fg, "'DM Mono'");
    storyText(ctx, "↗", x + w - 62, y + 102, 40, "500", color.fg);
  });

  if (items.length > MAX_ITEMS) {
    storyText(
      ctx,
      `+ ${items.length - MAX_ITEMS} MORE`,
      x + 24,
      startY + shown.length * (h + gap) + 30,
      19,
      "500",
      muted,
      "'DM Mono'"
    );
  }

  // Footer
  storyText(ctx, `@${displayName.toLowerCase()}`, 84, HEIGHT - 175, 19, "500", muted, "'DM Mono'");
  storyText(ctx, "SEE YOU LATER — OR NOT.", 84, HEIGHT - 130, 19, "500", muted, "'DM Mono'");
  storyText(ctx, "SYLATER.APP", 84, HEIGHT - 80, 19, "500", muted, "'DM Mono'");

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

export function ShareOverallButton({
  displayName,
  items,
  className,
  label = "Generate IG Story",
  onToast,
}: {
  displayName: string;
  items: Item[];
  className?: string;
  label?: string;
  onToast?: (message: string) => void;
}) {
  const [working, setWorking] = useState(false);

  async function handleShare() {
    setWorking(true);
    try {
      const blob = await drawWholePlanCard(displayName, items);
      if (!blob) return;

      const file = new File([blob], `${displayName.toLowerCase()}-sylon-plans.png`, {
        type: "image/png",
      });

      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({ files: [file], title: `${displayName}'s plans` });
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          // fall through to download
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${displayName.toLowerCase()}-sylon-plans.png`;
      a.click();
      URL.revokeObjectURL(url);
      onToast?.("IG Story image downloaded");
    } catch {
      onToast?.("Could not create the image — please try again");
    } finally {
      setWorking(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <button onClick={handleShare} disabled={working} className={className}>
      <strong>{working ? "Creating your story…" : label}</strong>
      <span aria-hidden="true">↗</span>
    </button>
  );
}
