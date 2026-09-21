"use client";

import { useState, useTransition } from "react";
import { setAvailability } from "@/app/actions/manifest";
import styles from "@/app/SylonDesign.module.css";

// A signal, not a commitment — members check the windows that could work
// for them and save. No tally is shown here (the host reads the pattern
// and writes it up in the summary card), so this just persists per-member
// checkboxes via manifest_availability.
export function AvailabilityPicker({
  manifestId,
  slug,
  windowOptions,
  initialSelected,
  signedIn,
}: {
  manifestId: string;
  slug: string;
  windowOptions: string[];
  initialSelected: string[];
  signedIn: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  if (windowOptions.length === 0) {
    return <p className="mt-6 text-sm text-muted">No windows set yet — ask the host to add some.</p>;
  }

  if (!signedIn) {
    return (
      <div>
        {windowOptions.map((w) => (
          <div key={w} className={styles.availabilityOption}>
            <span>{w}</span>
          </div>
        ))}
        <a href="/sign-in" className={`${styles.submitSmall}`} style={{ display: "inline-block" }}>
          Sign in to answer
        </a>
      </div>
    );
  }

  function toggle(w: string) {
    setSaved(false);
    setSelected((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
  }

  return (
    <div>
      {windowOptions.map((w) => (
        <label key={w} className={styles.availabilityOption} style={{ cursor: "pointer" }}>
          <input type="checkbox" checked={selected.includes(w)} onChange={() => toggle(w)} />
          <span>{w}</span>
        </label>
      ))}
      <button
        type="button"
        className={styles.submitSmall}
        disabled={isPending || saved}
        onClick={() =>
          startTransition(async () => {
            const result = await setAvailability(manifestId, slug, selected);
            if (result.ok) setSaved(true);
          })
        }
      >
        {isPending ? "Saving…" : saved ? "Saved" : "Save availability"}
      </button>
    </div>
  );
}
