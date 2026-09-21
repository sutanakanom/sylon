"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { drawItemStoryCard, shareOrDownloadImage } from "@/lib/story-canvas";
import { useT } from "./LocaleProvider";

// Renders a vertical 1080x1920 (9:16) card for Instagram Story sharing, for
// a single trip or manifest's detail page.

export function ShareStoryButton({
  item,
  variant = "default",
}: {
  item: Item;
  variant?: "default" | "subtle";
}) {
  const { t } = useT();
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");

  async function handleShare() {
    setStatus("working");
    const blob = await drawItemStoryCard(item);
    const outcome = await shareOrDownloadImage(blob, `${item.slug}-sylon-story.png`, item.title);
    setStatus(outcome === "failed" ? "error" : outcome === "cancelled" ? "idle" : "done");
  }

  const buttonLabel = status === "working" ? t("share.makingCard") : t("share.shareToStory");
  const statusLine =
    status === "done"
      ? t("share.savedOpenInstagram")
      : status === "error"
        ? t("share.couldNotCreateTryAgain")
        : null;

  if (variant === "subtle") {
    return (
      <div className="flex flex-col items-start gap-1">
        <button
          onClick={handleShare}
          disabled={status === "working"}
          className="mono-label text-[0.65rem] text-muted underline underline-offset-2 disabled:opacity-50"
        >
          {buttonLabel}
        </button>
        {statusLine && <span className="mono-label text-[0.6rem] text-muted">{statusLine}</span>}
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
        {buttonLabel}
      </button>
      {statusLine && <span className="mono-label text-[0.6rem] text-muted">{statusLine}</span>}
    </div>
  );
}
