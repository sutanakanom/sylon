"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { drawItemStoryCard, drawOverviewStoryCard, shareOrDownloadImage } from "@/lib/story-canvas";

// "Capture or share this on story" — generates an IG-Story-ready image of
// whichever carousel card is currently showing: the single item's own card
// design (reused from the trip/manifest detail pages) when a plan is
// active, or a simple overview list when the summary card is active. A
// placeholder design for now — the personal page's own dedicated capture
// design is a later pass.

export function CaptureCardButton({
  activeItem,
  displayName,
  items,
  className,
  label = "Capture or share this on story ↗",
  onToast,
}: {
  activeItem: Item | null;
  displayName: string;
  items: Item[];
  className?: string;
  label?: string;
  onToast?: (message: string) => void;
}) {
  const [working, setWorking] = useState(false);

  async function handleCapture() {
    setWorking(true);
    try {
      const blob = activeItem
        ? await drawItemStoryCard(activeItem)
        : await drawOverviewStoryCard(displayName, items);
      const filename = activeItem
        ? `${activeItem.slug}-sylon-story.png`
        : `${displayName.toLowerCase()}-sylon-atlas.png`;
      const shareTitle = activeItem ? activeItem.title : `${displayName}'s plans`;
      const outcome = await shareOrDownloadImage(blob, filename, shareTitle);
      if (outcome === "downloaded") onToast?.("Story image downloaded");
      if (outcome === "failed") onToast?.("Could not create the image — please try again");
    } catch {
      onToast?.("Could not create the image — please try again");
    } finally {
      setWorking(false);
    }
  }

  return (
    <button type="button" className={className} onClick={handleCapture} disabled={working}>
      {working ? "Making card…" : label}
    </button>
  );
}
