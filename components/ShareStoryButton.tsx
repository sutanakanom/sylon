"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { drawItemStoryCard, shareOrDownloadImage } from "@/lib/story-canvas";
import { useT } from "./LocaleProvider";
import { InstagramIcon } from "./InstagramIcon";
import styles from "@/app/SylonDesign.module.css";

// Icon-only "share this trip/manifest as an IG Story" button — renders a
// vertical 1080x1920 (9:16) card for the single item and hands it to the
// OS share sheet (or downloads it). Used on both trip and manifest detail
// pages, visible to any signed-in member (not just the owner).

export function ShareStoryButton({ item }: { item: Item }) {
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

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleShare}
        disabled={status === "working"}
        className={styles.iconButton}
        aria-label={buttonLabel}
      >
        <InstagramIcon />
      </button>
      {statusLine && <span className="mono-label text-[0.6rem] text-muted">{statusLine}</span>}
    </div>
  );
}
