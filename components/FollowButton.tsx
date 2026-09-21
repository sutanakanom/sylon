"use client";

import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/actions/interactions";

export function FollowButton({
  itemType,
  itemId,
  slug,
  initialFollowing,
  signedIn,
  followLabel = "Follow",
  followingLabel = "Following",
}: {
  itemType: "trip" | "manifest";
  itemId: string;
  slug: string;
  initialFollowing: boolean;
  signedIn: boolean;
  followLabel?: string;
  followingLabel?: string;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <a
        href="/sign-in"
        className="mono-label border-[1.5px] border-ink px-4 py-2 text-[0.7rem] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)]"
      >
        Sign in to follow
      </a>
    );
  }

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await toggleFollow(itemType, itemId, slug);
          if (result.ok) setFollowing(result.following);
        })
      }
      disabled={isPending}
      className={`mono-label border-[1.5px] border-ink px-4 py-2 text-[0.7rem] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50 ${
        following ? "bg-acid text-ink" : "bg-transparent"
      }`}
    >
      {following ? followingLabel : followLabel}
    </button>
  );
}
