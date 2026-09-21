import { Item } from "@/lib/types";

// A small "is this a Trip or a Manifest" badge, shown next to the stage
// badge (StatusStamp / labelFor) wherever a plan is shown as its own card:
// the trip/manifest detail hero, the personal page's carousel and board.
//
// Trip = acid, Manifest = orange — the same kind-based colors ItemCard
// already used, so the two badges read consistently if that card is ever
// brought back into use.

const KIND_LABEL: Record<Item["kind"], string> = { trip: "Trip", manifest: "Manifest" };
const KIND_STYLE: Record<Item["kind"], string> = {
  trip: "bg-acid text-ink border-ink",
  manifest: "bg-orange text-ink border-ink",
};

export function KindBadge({ kind, size = "md" }: { kind: Item["kind"]; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "px-2 py-1 text-[0.55rem]" : "px-2.5 py-1.5 text-[0.65rem]";
  return <span className={`mono-label border ${dims} ${KIND_STYLE[kind]}`}>{KIND_LABEL[kind]}</span>;
}
