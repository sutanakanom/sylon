import Link from "next/link";
import { Item } from "@/lib/types";
import { labelFor } from "./StatusStamp";

const BG_BY_INDEX = ["bg-ink text-paper", "bg-acid text-ink", "bg-orange text-ink", "bg-paper text-ink"];

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
      className={`group relative flex min-h-[280px] flex-col justify-between border-[1.5px] border-ink p-5 transition-transform duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--ink)] ${bg}`}
    >
      <div className="flex items-start justify-between">
        <span className="mono-label rounded-full border border-current px-2.5 py-1.5 text-[0.65rem]">
          {item.visibility === "public" ? "Public" : "Invite-only"}
        </span>
        <span className="mono-label text-[0.7rem]">{whenText(item)}</span>
      </div>

      <h3 className="my-4 text-3xl leading-[0.95] font-extrabold tracking-tight uppercase max-w-[85%]">
        {item.title}
      </h3>

      <div className="flex items-end justify-between gap-4">
        <p className="max-w-[240px] text-sm leading-snug opacity-90">
          {label}
          {whereText(item) ? ` · ${whereText(item)}` : ""}. {item.summary}
        </p>
        <span className="text-2xl leading-none transition-transform duration-200 group-hover:translate-x-1.5 group-hover:-translate-y-1.5">
          ↗
        </span>
      </div>
      {item.kind === "manifest" && <MomentumBar votes={item.countryVotes} />}
    </Link>
  );
}
