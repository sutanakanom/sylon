"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { drawItemStoryCard, drawOverviewStoryCard, shareOrDownloadImage } from "@/lib/story-canvas";
import { useT } from "@/components/LocaleProvider";
import { InstagramIcon } from "@/components/InstagramIcon";

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
  label,
  iconOnly,
  onToast,
}: {
  activeItem: Item | null;
  displayName: string;
  items: Item[];
  className?: string;
  label?: string;
  iconOnly?: boolean;
  onToast?: (message: string) => void;
}) {
  const { t } = useT();
  const [working, setWorking] = useState(false);
  const buttonLabel = label ?? t("personalPage.captureShare");

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
      if (outcome === "downloaded") onToast?.(t("share.storyDownloaded"));
      if (outcome === "failed") onToast?.(t("share.couldNotCreate"));
    } catch {
      onToast?.(t("share.couldNotCreate"));
    } finally {
      setWorking(false);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleCapture}
      disabled={working}
      aria-label={iconOnly ? buttonLabel : undefined}
    >
      {iconOnly ? <InstagramIcon /> : working ? t("share.makingCard") : buttonLabel}
    </button>
  );
}
