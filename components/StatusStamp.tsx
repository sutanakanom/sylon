import { Item, TRIP_LABEL, MANIFEST_LABEL } from "@/lib/types";

export function labelFor(item: Item): string {
  return item.kind === "trip" ? TRIP_LABEL[item.status] : MANIFEST_LABEL[item.status];
}

const CONFIRMED = new Set(["See you"]);
const MAYBE = new Set(["See you, maybe"]);
const OPEN = new Set(["Should we see?"]);

function stampClasses(label: string): string {
  if (CONFIRMED.has(label)) return "bg-acid text-ink";
  if (MAYBE.has(label)) return "bg-orange text-ink";
  if (OPEN.has(label)) return "bg-ink text-acid";
  return "bg-paper text-muted";
}

export function StatusStamp({ item, size = "md" }: { item: Item; size?: "sm" | "md" }) {
  const label = labelFor(item);
  const dims = size === "sm" ? "w-[64px] h-[64px] text-[0.5rem]" : "w-[88px] h-[88px] text-[0.62rem]";
  return (
    <span
      className={`mono-label ${dims} ${stampClasses(label)} border-2 border-current rounded-full grid place-items-center text-center leading-tight -rotate-[8deg] shrink-0`}
    >
      {label}
    </span>
  );
}
