"use client";

import { useState, useTransition } from "react";
import { joinItem } from "@/app/actions/interactions";
import { useT } from "./LocaleProvider";

export function JoinButton({
  itemType,
  itemId,
  slug,
  initialJoined,
  signedIn,
  joinLabel,
  joinedLabel,
}: {
  itemType: "trip" | "manifest";
  itemId: string;
  slug: string;
  initialJoined: boolean;
  signedIn: boolean;
  joinLabel?: string;
  joinedLabel?: string;
}) {
  const { t } = useT();
  const [joined, setJoined] = useState(initialJoined);
  const [isPending, startTransition] = useTransition();

  const resolvedJoinLabel = joinLabel ?? t("tripDetail.joinThisTrip");
  const resolvedJoinedLabel = joinedLabel ?? t("tripDetail.youreIn");

  if (!signedIn) {
    return (
      <a
        href="/sign-in"
        className="mono-label border-[1.5px] border-ink bg-ink px-5 py-3 text-[0.75rem] text-paper"
      >
        {t("tripDetail.signInToJoin")}
      </a>
    );
  }

  if (joined) {
    return (
      <span className="mono-label border-[1.5px] border-ink bg-acid px-5 py-3 text-[0.75rem] text-ink">
        {resolvedJoinedLabel}
      </span>
    );
  }

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await joinItem(itemType, itemId, slug);
          if (result.ok) setJoined(true);
        })
      }
      disabled={isPending}
      className="mono-label border-[1.5px] border-ink bg-ink px-5 py-3 text-[0.75rem] text-paper transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
    >
      {isPending ? t("tripDetail.joining") : resolvedJoinLabel}
    </button>
  );
}
