import Link from "next/link";
import { Item } from "@/lib/types";
import { labelFor } from "./StatusStamp";

const BG_BY_INDEX = ["bg-ink text-paper", "bg-acid text-ink", "bg-orange text-ink", "bg-paper text-ink"];

// Fixed, kind-based colors — independent of the card's own rotating
// background — so a Trip vs. a Manifest reads the same at a glance no
// matter which background it lands on. Trip = acid (confirmed-leaning,
// the "real plan" color already used for the confirmed StatusStamp),
// Manifest = orange (the "still forming" color already used for maybe).
const KIND_BADGE: Record<Item["kind"], string> = {
  trip: "bg-acid text-ink border-ink",
  manifest: "bg-orange text-ink border-ink",
};
const KIND_LABEL: Record<Item["kind"], string> = {
  trip: "Trip",
  manifest: "Manifest",
};
const KIND_ACCENT: Record<Item["kind"], string> = {
  trip: "border-l-acid",
  manifest: "border-l-orange",
};

function whenText(item: Item): string {
  return item.roughDate;
}

function whereText(item: Item): string {
  if (item.kind === "trip") return item.countries.join(" + ");
  return item.countryVotes.map((v) => v.country).join(" or ");
}

// A small "momentum" bar for Manifests — how lopsided the voting is
// toward the leading country so far. Gamification style is still an open
// question in the doc; this is a lightweight, reversible starting point
// using data that's already public (vote counts, no names).
function MomentumBar({ votes }: { votes: { country: string; votes: number }[] }) {
  const total = votes.reduce((sum, v) => sum + v.votes, 0);
  if (total === 0) return null;
  const leader = votes.slice().sort((a, b) => b.votes - a.votes)[0];
  const share = Math.round((leader.votes / total) * 100);

  return (
    <div className="mt-3 flex flex-col gap-1">
      <div className="h-2 w-full border border-current opacity-90">
        <div className="h-full bg-current" style={{ width: `${share}%` }} />
      </div>
      <span className="mono-label text-[0.6rem] opacity-75">
        {leader.country} leading · {total} vote{total === 1 ? "" : "s"} so far
      </span>
    </div>
  );
}

export function ItemCard({ item, index }: { item: Item; index: number }) {
  const bg = BG_BY_INDEX[index % BG_BY_INDEX.length];
  const label = labelFor(item);

  return (
    <Link
      href={`/${item.kind === "trip" ? "trip" : "manifest"}/${item.slug}`}
      className={`group relative flex min-h-[300px] flex-col justify-between border-[1.5px] border-l-[6px] ${KIND_ACCENT[item.kind]} border-ink p-5 transition-transform duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--ink)] ${bg}`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`mono-label border px-2.5 py-1.5 text-[0.65rem] ${KIND_BADGE[item.kind]}`}
        >
          {KIND_LABEL[item.kind]}
        </span>
        <div className="flex flex-col items-end gap-1">
          <span className="mono-label text-[0.7rem]">{whenText(item)}</span>
          <span className="mono-label text-[0.55rem] opacity-60">
            {item.visibility === "public" ? "Public" : "Invite-only"}
          </span>
        </div>
      </div>

      <h3 className="my-4 text-3xl leading-[0.95] font-extrabold tracking-tight uppercase max-w-[85%]">
        {item.title}
      </h3>

      <div className="flex items-end justify-between gap-4">
        <p className="max-w-[240px] text-sm leading-snug opacity-90">
          {label}. {item.summary}
        </p>
        <span className="text-2xl leading-none transition-transform duration-200 group-hover:translate-x-1.5 group-hover:-translate-y-1.5">
          ↗
        </span>
      </div>

      {whereText(item) && (
        <div className="mono-label mt-3 border-t border-current pt-2 text-[0.65rem] opacity-80">
          {whereText(item)}
        </div>
      )}
      {item.kind === "manifest" && <MomentumBar votes={item.countryVotes} />}
    </Link>
  );
}
