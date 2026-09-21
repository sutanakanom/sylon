"use client";

import { useState, useTransition } from "react";
import { convertToTrip } from "@/app/actions/manifest";

export function FinalizeButton({ manifestId, slug }: { manifestId: string; slug: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={() =>
          startTransition(async () => {
            const result = await convertToTrip(manifestId, slug);
            // convertToTrip redirects on success, so we only ever see a
            // return value here on failure.
            if (result && !result.ok) setError(result.error);
          })
        }
        disabled={isPending}
        className="mono-label border-[1.5px] border-ink bg-acid px-5 py-3 text-[0.75rem] text-ink transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
      >
        {isPending ? "Finalizing…" : "Finalize → make it a Trip"}
      </button>
      {error && <p className="text-sm text-orange">{error}</p>}
    </div>
  );
}
