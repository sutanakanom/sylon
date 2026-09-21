"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { drawWholePlanStoryCard, shareOrDownloadImage } from "@/lib/story-canvas";
import { useT } from "./LocaleProvider";

// The personal page's "Generate IG Story" button — a 1080x1920 board of
// plain, clearly-labelled boxes (labelFor's "See you"/"Should we see?"/
// etc. wording), one per public plan.

export function ShareOverallButton({
  displayName,
  items,
  className,
  label,
  onToast,
}: {
  displayName: string;
  items: Item[];
  className?: string;
  label?: string;
  onToast?: (message: string) => void;
}) {
  const { t } = useT();
  const [working, setWorking] = useState(false);
  const buttonLabel = label ?? t("personalPage.generateStory");

  async function handleShare() {
    setWorking(true);
    try {
      const blob = await drawWholePlanStoryCard(displayName, items);
      const outcome = await shareOrDownloadImage(
        blob,
        `${displayName.toLowerCase()}-sylon-plans.png`,
        `${displayName}'s plans`
      );
      if (outcome === "downloaded") onToast?.(t("share.storyDownloaded"));
      if (outcome === "failed") onToast?.(t("share.couldNotCreate"));
    } catch {
      onToast?.(t("share.couldNotCreate"));
    } finally {
      setWorking(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <button onClick={handleShare} disabled={working} className={className}>
      <strong>{working ? t("personalPage.creatingStory") : buttonLabel}</strong>
      <span aria-hidden="true">↗</span>
    </button>
  );
}
