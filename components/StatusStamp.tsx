"use client";

import { Item } from "@/lib/types";
import { labelFor } from "@/lib/item-display";
import { useLocale } from "./LocaleProvider";

// labelFor lives in lib/item-display.ts (it needs to be callable from
// plain .ts files like lib/story-canvas.ts too, not just components) —
// re-exported here so existing `import { labelFor } from
// "@/components/StatusStamp"` call sites keep working unchanged.
export { labelFor };

// Color is keyed off (kind, status) — NOT the label text — so the stamp
// still gets the right color regardless of language.
const CONFIRMED_STATUS: Record<Item["kind"], string[]> = {
  trip: ["confirmed"],
  manifest: ["converted"],
};
const MAYBE_STATUS: Record<Item["kind"], string[]> = {
  trip: ["planning"],
  manifest: [],
};
const OPEN_STATUS: Record<Item["kind"], string[]> = {
  trip: [],
  manifest: ["open"],
};

function stampClasses(item: Item): string {
  if (CONFIRMED_STATUS[item.kind].includes(item.status)) return "bg-acid text-ink";
  if (MAYBE_STATUS[item.kind].includes(item.status)) return "bg-orange text-ink";
  if (OPEN_STATUS[item.kind].includes(item.status)) return "bg-ink text-acid";
  return "bg-paper text-muted";
}

export function StatusStamp({ item, size = "md" }: { item: Item; size?: "sm" | "md" }) {
  const locale = useLocale();
  const label = labelFor(item, locale);
  const dims = size === "sm" ? "w-[64px] h-[64px] text-[0.5rem]" : "w-[88px] h-[88px] text-[0.62rem]";
  return (
    <span
      className={`mono-label ${dims} ${stampClasses(item)} border-2 border-current rounded-full grid place-items-center text-center leading-tight -rotate-[8deg] shrink-0`}
    >
      {label}
    </span>
  );
}
