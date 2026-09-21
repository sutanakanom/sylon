"use client";

import { useState } from "react";
import { Item } from "@/lib/types";

// Same idea as ShareStoryButton, but for the personal page as a whole:
// a summary card listing every public plan instead of one item's detail.
// Rough info only, same as the per-item card (titles + rough dates — no
// exact dates, no member names).

const WIDTH = 1080;
const HEIGHT = 1920;
const MAX_ITEMS = 6;

async function drawSummaryCard(displayName: string, items: Item[]): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  await Promise.all([
    document.fonts.load("800 64px Manrope"),
    document.fonts.load("700 36px Manrope"),
    document.fonts.load("500 28px 'DM Mono'"),
  ]);

  const ink = "#11110F";
  const paper = "#F3F0E8";
  const acid = "#D8FF43";
  const orange = "#FF6B35";
  const muted = "#716F68";

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, WIDTH - 48, HEIGHT - 48);

  // Wordmark
  ctx.fillStyle = ink;
  ctx.font = "700 40px Manrope";
  ctx.fillText("SYLON", 80, 150);
  ctx.font = "500 22px 'DM Mono'";
  ctx.fillStyle = muted;
  ctx.fillText("SEE YOU LATER (OR NOT)", 80, 185);

  // Title
  ctx.fillStyle = ink;
  ctx.font = "800 72px Manrope";
  wrapTextLeft(ctx, `${displayName.toUpperCase()}'S PLANS`, 80, 320, 920, 76);

  // List of items
  let y = 480;
  const shown = items.slice(0, MAX_ITEMS);
  shown.forEach((item, i) => {
    const color = item.kind === "trip" ? acid : orange;
    ctx.fillStyle = ink;
    ctx.fillRect(80, y - 34, 14, 44);
    ctx.fillStyle = color;
    ctx.font = "700 22px 'DM Mono'";
    ctx.fillText(item.kind === "trip" ? "TRIP" : "MANIFEST", 114, y - 8);
    ctx.fillStyle = ink;
    ctx.font = "800 44px Manrope";
    wrapTextLeft(ctx, item.title.toUpperCase(), 114, y + 32, 880, 48);
    ctx.fillStyle = muted;
    ctx.font = "500 26px 'DM Mono'";
    ctx.fillText(item.roughDate.toUpperCase(), 114, y + 76);
    y += 170;
  });

  if (items.length > MAX_ITEMS) {
    ctx.fillStyle = muted;
    ctx.font = "500 26px 'DM Mono'";
    ctx.fillText(`+ ${items.length - MAX_ITEMS} MORE`, 114, y);
  }

  // Footer
  ctx.fillStyle = muted;
  ctx.font = "500 26px 'DM Mono'";
  ctx.fillText("SYLATER.APP", 80, HEIGHT - 100);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
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

export function ShareOverallButton({
  displayName,
  items,
  className,
  label = "Share overall plan to IG Story ↗",
}: {
  displayName: string;
  items: Item[];
  className?: string;
  label?: string;
}) {
  const [status, setStatus] = useState<"idle" | "working" | "done">("idle");

  async function handleShare() {
    setStatus("working");
    const blob = await drawSummaryCard(displayName, items);
    if (!blob) {
      setStatus("idle");
      return;
    }

    const file = new File([blob], `${displayName}-sylon-plans.png`, { type: "image/png" });

    if (
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({ files: [file], title: `${displayName}'s plans` });
        setStatus("done");
        return;
      } catch {
        // user cancelled the share sheet — fall through to download
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${displayName}-sylon-plans.png`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("done");
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleShare}
        disabled={status === "working"}
        className={
          className ??
          "mono-label border-[1.5px] border-ink px-4 py-2 text-[0.7rem] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
        }
      >
        {status === "working" ? "Making card…" : label}
      </button>
      {status === "done" && (
        <span className="mono-label text-[0.6rem] text-muted">
          Saved — open Instagram and add it to your Story.
        </span>
      )}
    </div>
  );
}
