import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicItems, handleExists } from "@/lib/data";
import { ItemCard } from "@/components/ItemCard";
import { ProfileChip } from "@/components/ProfileChip";
import { getCurrentMember } from "@/lib/current-member";
import { signOut } from "@/app/actions/auth";

export default async function PersonalPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const [exists, items, member] = await Promise.all([
    handleExists(handle),
    getPublicItems(handle),
    getCurrentMember(),
  ]);

  if (!exists) notFound();

  const displayName = handle.charAt(0).toUpperCase() + handle.slice(1);
  const upcomingCount = items.filter(
    (i) => i.kind === "trip" && (i.status === "confirmed" || i.status === "planning")
  ).length;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between border-b-[1.5px] border-ink px-6 py-5 md:px-10">
        <Link href="/">
          <span className="text-lg font-extrabold tracking-tight uppercase">SYLON</span>
          <span className="mono-label ml-3 hidden text-[0.65rem] text-muted sm:inline">
            See You Later (or not)
          </span>
        </Link>
        {member ? (
          <div className="flex items-center gap-4">
            <ProfileChip member={member} />
            <form action={signOut}>
              <button
                type="submit"
                className="mono-label text-[0.65rem] text-muted underline underline-offset-2"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <a
            href="/sign-in"
            className="mono-label border-[1.5px] border-ink px-4 py-2 text-[0.7rem] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)]"
          >
            Sign in
          </a>
        )}
      </header>

      {/* Hero */}
      <section className="grid gap-6 border-b-[1.5px] border-ink px-6 py-14 md:grid-cols-[1fr_320px] md:px-10 md:py-20">
        <div>
          <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight uppercase md:text-7xl">
            See you
            <br />
            later.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-snug text-muted">
            {displayName}&apos;s trips and travel ideas — some solid, some still just a maybe.
            Public plans below; ask for an invite to see the rest.
          </p>
        </div>
        <div className="flex flex-col justify-between border-[1.5px] border-ink bg-acid p-5 text-ink">
          <span className="mono-label text-[0.65rem]">Right now</span>
          <span className="text-6xl font-extrabold leading-none">{upcomingCount}</span>
          <span className="mono-label text-[0.65rem]">upcoming, publicly</span>
        </div>
      </section>

      {/* Ticker */}
      {items.length > 0 && (
        <div className="mono-label overflow-hidden border-b-[1.5px] border-ink bg-ink py-2 text-[0.7rem] text-paper">
          <div className="whitespace-nowrap">
            {Array(2)
              .fill(
                items
                  .map((i) => `${i.title.toUpperCase()} — ${i.status.toUpperCase()}`)
                  .join(" · ") + " · "
              )
              .join("")}
          </div>
        </div>
      )}

      {/* Grid */}
      <section className="grid grid-cols-1 gap-4 px-6 py-10 sm:grid-cols-2 md:px-10 lg:grid-cols-3">
        {items.map((item, index) => (
          <ItemCard key={item.id} item={item} index={index} />
        ))}
        <div className="flex min-h-[280px] flex-col justify-center border-[1.5px] border-dashed border-muted p-5 text-center text-muted">
          <p className="text-sm leading-snug">
            A couple more plans are visible only to people {displayName} has invited.
          </p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-y-[1.5px] border-ink bg-ink px-6 py-16 text-paper md:px-10">
        <p className="mx-auto max-w-2xl text-center text-2xl font-medium leading-snug md:text-3xl">
          Not every plan is a promise. Some are just a place we haven&apos;t been yet —
          and an open invitation to whoever wants to help make it real.
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-auto flex flex-col items-center gap-1 px-6 py-8 text-center">
        <span className="mono-label text-[0.65rem] text-footer-grey">
          SYLON — See You Later (or not)
        </span>
        <span className="mono-label text-[0.65rem] text-footer-grey">@{handle}</span>
      </footer>
    </div>
  );
}
