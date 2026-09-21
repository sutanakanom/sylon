"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { drawWholePlanStoryCard, shareOrDownloadImage } from "@/lib/story-canvas";

// The personal page's "Generate IG Story" button — a 1080x1920 board of
// plain, clearly-labelled boxes (labelFor's "See you"/"Should we see?"/
// etc. wording), one per public plan.

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
      const blob = await drawWholePlanStoryCard(displayName, items);
      const outcome = await shareOrDownloadImage(
        blob,
        `${displayName.toLowerCase()}-sylon-plans.png`,
        `${displayName}'s plans`
      );
      if (outcome === "downloaded") onToast?.("IG Story image downloaded");
      if (outcome === "failed") onToast?.("Could not create the image — please try again");
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
