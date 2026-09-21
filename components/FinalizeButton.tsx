"use client";

import { useState, useTransition } from "react";
import { convertToTrip } from "@/app/actions/manifest";
import { useT } from "./LocaleProvider";

// variant="wide" matches the manifest v2 conversion card's full-width
// button (styles.convertButton, greyed out via :disabled when the two
// Open anchors — location + dates — aren't set yet). Default keeps the
// original compact hero styling used elsewhere.
export function FinalizeButton({
  manifestId,
  slug,
  disabled,
  variant = "compact",
  className,
  label,
}: {
  manifestId: string;
  slug: string;
  disabled?: boolean;
  variant?: "compact" | "wide";
  className?: string;
  label?: string;
}) {
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const wide = variant === "wide";
  const resolvedLabel = label ?? t("manifestDetail.convertToTrip");

  return (
    <div className={wide ? "" : "flex flex-col items-end gap-2"}>
      <button
        onClick={() =>
          startTransition(async () => {
            const result = await convertToTrip(manifestId, slug);
            // convertToTrip redirects on success, so we only ever see a
            // return value here on failure.
            if (result && !result.ok) setError(result.error);
          })
        }
        disabled={isPending || disabled}
        className={
          className ??
          (wide
            ? undefined
            : "mono-label border-[1.5px] border-ink bg-acid px-5 py-3 text-[0.75rem] text-ink transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50")
        }
      >
        {isPending ? t("manifestDetail.finalizing") : resolvedLabel}
      </button>
      {error && <p className="text-sm text-orange">{error}</p>}
    </div>
  );
}
