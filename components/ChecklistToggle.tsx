"use client";

import { useState, useTransition } from "react";
import { toggleChecklistItem } from "@/app/actions/items";
import { ChecklistItem } from "@/lib/types";
import styles from "@/app/SylonDesign.module.css";

// The trip host's "before we go" list — clickable only for the host, so
// they can check things off right from the page. Everyone else sees the
// same list read-only.
export function ChecklistToggle({
  tripId,
  slug,
  initialChecklist,
  canEdit,
}: {
  tripId: string;
  slug: string;
  initialChecklist: ChecklistItem[];
  canEdit: boolean;
}) {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [isPending, startTransition] = useTransition();

  return (
    <ul className={styles.checklist}>
      {checklist.map((item, i) => (
        <li key={i}>
          <button
            type="button"
            disabled={!canEdit || isPending}
            onClick={() => {
              setChecklist((prev) =>
                prev.map((c, idx) => (idx === i ? { ...c, done: !c.done } : c))
              );
              startTransition(async () => {
                const result = await toggleChecklistItem(tripId, slug, i);
                if (!result.ok) {
                  // Revert on failure.
                  setChecklist((prev) =>
                    prev.map((c, idx) => (idx === i ? { ...c, done: !c.done } : c))
                  );
                }
              });
            }}
            className={`${styles.checklistItem} ${item.done ? styles.checklistDone : ""}`}
          >
            <span className={styles.checklistCheck} aria-hidden="true">
              {item.done ? "✓" : ""}
            </span>
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
