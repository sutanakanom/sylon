import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemBySlug } from "@/lib/data";
import { getCurrentMember } from "@/lib/current-member";
import { getComments, isFollowing } from "@/app/actions/interactions";
import { labelFor, StatusStamp } from "@/components/StatusStamp";
import { ProfileChip } from "@/components/ProfileChip";
import { CommentThread } from "@/components/CommentThread";
import { FollowButton } from "@/components/FollowButton";
import { signOut } from "@/app/actions/auth";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item || item.kind !== "trip") notFound();

  const member = await getCurrentMember();

  // Invite-only items need a signed-in member for now — full per-item
  // invite access (checking they were specifically invited to *this*
  // trip) is a later build step, not yet wired in.
  if (item.visibility === "invite-only" && !member) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="mono-label text-[0.7rem] text-muted">Invite-only</p>
        <h1 className="text-2xl font-extrabold uppercase">This one&apos;s private</h1>
        <p className="max-w-sm text-sm text-muted">
          Ask whoever shared this link with you for an invite, then sign in.
        </p>
        <Link
          href="/sign-in"
          className="mono-label border-[1.5px] border-ink px-5 py-3 text-[0.75rem]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const [comments, following] = await Promise.all([
    getComments("trip", item.id),
    isFollowing("trip", item.id),
  ]);

  const label = labelFor(item);
  const memberDisplayName = member?.displayName || member?.email.split("@")[0] || null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b-[1.5px] border-ink px-6 py-5 md:px-10">
        <Link href="/" className="text-lg font-extrabold tracking-tight uppercase">
          SYLON
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
            className="mono-label border-[1.5px] border-ink px-4 py-2 text-[0.7rem]"
          >
            Sign in
          </a>
        )}
      </header>

      {/* Hero */}
      <section className="flex flex-col gap-6 border-b-[1.5px] border-ink px-6 py-12 md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <span className="mono-label text-[0.7rem] text-muted">{item.roughDate}</span>
          <h1 className="mt-2 text-4xl font-extrabold uppercase leading-none md:text-6xl">
            {item.title}
          </h1>
        </div>
        <StatusStamp item={item} size="md" />
      </section>

      {/* Detail blocks */}
      <section className="grid grid-cols-1 gap-4 border-b-[1.5px] border-ink px-6 py-10 sm:grid-cols-2 md:px-10">
        <div className="border-[1.5px] border-ink p-5">
          <span className="mono-label text-[0.65rem] text-muted">Calendar</span>
          <div className="mt-3 flex flex-col gap-2">
            {item.legs.map((leg, i) => (
              <p key={i} className="text-sm">
                <span className="font-bold">{leg.place}</span> — {leg.startDate} to {leg.endDate}
              </p>
            ))}
          </div>
        </div>
        <div className="border-[1.5px] border-ink p-5">
          <span className="mono-label text-[0.65rem] text-muted">Country</span>
          <p className="mt-3 text-sm">{item.countries.join(" + ")}</p>
        </div>
        <div className="border-[1.5px] border-ink p-5">
          <span className="mono-label text-[0.65rem] text-muted">Members</span>
          <p className="mt-3 text-sm">{item.memberCount} going</p>
        </div>
        <div className="border-[1.5px] border-ink p-5">
          <span className="mono-label text-[0.65rem] text-muted">Status</span>
          <p className="mt-3 text-sm">{label}</p>
        </div>
      </section>

      {/* Follow + comments */}
      <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 md:px-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-extrabold uppercase">Comments</h2>
          <FollowButton
            itemType="trip"
            itemId={item.id}
            slug={item.slug}
            initialFollowing={following}
            signedIn={Boolean(member)}
          />
        </div>
        <CommentThread
          itemType="trip"
          itemId={item.id}
          slug={item.slug}
          initialComments={comments}
          currentMemberName={memberDisplayName}
        />
      </section>

      <footer className="flex flex-col items-center gap-1 px-6 py-8 text-center">
        <span className="mono-label text-[0.65rem] text-footer-grey">
          SYLON — See You Later (or not)
        </span>
      </footer>
    </div>
  );
}
