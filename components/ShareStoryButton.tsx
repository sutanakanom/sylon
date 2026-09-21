"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { labelFor } from "./StatusStamp";

// Renders a vertical 1080x1920 (9:16) card for Instagram Story sharing.
// Rough info only — title, rough date, rough place, status label — never
// exact dates or member names, per the requirements doc's Platform
// requirements and rough-view rules. Uses <canvas> so no server-side
// image dependency is needed; on mobile this hands the image straight to
// the OS share sheet (which lists Instagram as a target), and falls back
// to a plain download everywhere else.

const WIDTH = 1080;
const HEIGHT = 1920;

function whereText(item: Item): string {
  if (item.kind === "trip") return item.countries.join(" + ");
  return item.countryVotes.map((v) => v.country).join(" or ");
}

async function drawCard(item: Item): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Make sure the real webfonts are loaded before drawing text with them.
  await Promise.all([
    document.fonts.load("800 84px Manrope"),
    document.fonts.load("700 36px Manrope"),
    document.fonts.load("500 28px 'DM Mono'"),
  ]);

  const ink = "#11110F";
  const paper = "#F3F0E8";
  const acid = "#D8FF43";
  const muted = "#716F68";

  // Background
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Border
  ctx.strokeStyle = ink;
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, WIDTH - 48, HEIGHT - 48);

  // Wordmark
  ctx.fillStyle = ink;
  ctx.font = "700 40px Manrope";
  ctx.fillText("SYLON", 80, 140);
  ctx.font = "500 22px 'DM Mono'";
  ctx.fillStyle = muted;
  ctx.fillText("SEE YOU LATER (OR NOT)", 80, 175);

  // Status stamp (rotated circle)
  const label = labelFor(item);
  ctx.save();
  ctx.translate(WIDTH - 220, 260);
  ctx.rotate((-8 * Math.PI) / 180);
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(0, 0, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = acid;
  ctx.font = "700 26px 'DM Mono'";
  ctx.textAlign = "center";
  wrapText(ctx, label.toUpperCase(), 0, 0, 200, 30);
  ctx.restore();
  ctx.textAlign = "left";

  // Rough date
  ctx.fillStyle = muted;
  ctx.font = "500 30px 'DM Mono'";
  ctx.fillText(item.roughDate.toUpperCase(), 80, 420);

  // Title
  ctx.fillStyle = ink;
  ctx.font = "800 84px Manrope";
  wrapTextLeft(ctx, item.title.toUpperCase(), 80, 520, 900, 88);

  // Where (rough)
  const where = whereText(item);
  if (where) {
    ctx.fillStyle = ink;
    ctx.font = "700 40px Manrope";
    ctx.fillText(where, 80, HEIGHT - 260);
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

function wrapText(
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

export function ShareStoryButton({
  item,
  variant = "default",
}: {
  item: Item;
  variant?: "default" | "subtle";
}) {
  const [status, setStatus] = useState<"idle" | "working" | "done">("idle");

  async function handleShare() {
    setStatus("working");
    const blob = await drawCard(item);
    if (!blob) {
      setStatus("idle");
      return;
    }

    const file = new File([blob], `${item.slug}-sylon-story.png`, { type: "image/png" });

    // On mobile, this hands the image to the OS share sheet, which lists
    // Instagram (Add to Story) as a target. Desktop browsers generally
    // don't support sharing files this way, so we fall back to a plain
    // download there.
    if (
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({ files: [file], title: item.title });
        setStatus("done");
        return;
      } catch {
        // user cancelled the share sheet — fall through to download
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.slug}-sylon-story.png`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("done");
  }

  if (variant === "subtle") {
    return (
      <div className="flex flex-col items-start gap-1">
        <button
          onClick={handleShare}
          disabled={status === "working"}
          className="mono-label text-[0.65rem] text-muted underline underline-offset-2 disabled:opacity-50"
        >
          {status === "working" ? "Making card…" : "Share to IG Story ↗"}
        </button>
        {status === "done" && (
          <span className="mono-label text-[0.6rem] text-muted">
            Saved — open Instagram and add it to your Story.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleShare}
        disabled={status === "working"}
        className="mono-label border-[1.5px] border-ink px-4 py-2 text-[0.7rem] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
      >
        {status === "working" ? "Making card…" : "Share to IG Story ↗"}
      </button>
      {status === "done" && (
        <span className="mono-label text-[0.6rem] text-muted">
          Saved — open Instagram and add it to your Story.
        </span>
      )}
    </div>
  );
}
