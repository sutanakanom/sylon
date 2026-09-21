import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemBySlug } from "@/lib/data";
import { getCurrentMember } from "@/lib/current-member";
import { getManifestors, getChatMessages, isManifestor } from "@/app/actions/manifest";
import { labelFor, StatusStamp } from "@/components/StatusStamp";
import { SiteShell } from "@/components/SiteShell";
import { ManifestorPanel } from "@/components/ManifestorPanel";
import { ChatFeed } from "@/components/ChatFeed";
import { FinalizeButton } from "@/components/FinalizeButton";
import { ShareStoryButton } from "@/components/ShareStoryButton";

export default async function ManifestDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item || item.kind !== "manifest") notFound();

  const member = await getCurrentMember();

  if (item.visibility === "invite-only" && !member) {
    return (
      <SiteShell member={member} centerLabel="Invite-only">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
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
      </SiteShell>
    );
  }

  const [manifestors, messages, iAmManifestor] = await Promise.all([
    getManifestors(item.id),
    getChatMessages(item.id),
    isManifestor(item.id),
  ]);

  const label = labelFor(item);
  const alreadyConverted = item.status === "converted";

  return (
    <SiteShell member={member} centerLabel={item.title}>
      {/* Hero */}
      <section className="flex flex-col gap-6 border-b-[1.5px] border-ink px-6 py-12 md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <span className="mono-label text-[0.7rem] text-muted">{item.roughDate}</span>
          <h1 className="mt-2 text-4xl font-extrabold uppercase leading-none md:text-6xl">
            {item.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <StatusStamp item={item} size="md" />
          {iAmManifestor && !alreadyConverted && (
            <FinalizeButton manifestId={item.id} slug={item.slug} />
          )}
        </div>
      </section>

      {alreadyConverted && (
        <div className="border-b-[1.5px] border-ink bg-ink px-6 py-4 text-center text-paper md:px-10">
          <p className="mono-label text-[0.7rem]">
            This became a real trip —{" "}
            <a href={`/trip/${item.slug}-trip`} className="underline underline-offset-2">
              see it here
            </a>
            .
          </p>
        </div>
      )}

      {/* Detail blocks */}
      <section className="grid grid-cols-1 gap-4 border-b-[1.5px] border-ink px-6 py-10 sm:grid-cols-2 md:px-10">
        <div className="border-[1.5px] border-ink p-5">
          <span className="mono-label text-[0.65rem] text-muted">Country votes</span>
          <ul className="mt-3 flex flex-col gap-1">
            {item.countryVotes.map((v) => (
              <li key={v.country} className="text-sm">
                <span className="font-bold">{v.country}</span> — {v.votes} vote
                {v.votes === 1 ? "" : "s"}
              </li>
            ))}
          </ul>
        </div>
        <div className="border-[1.5px] border-ink p-5">
          <span className="mono-label text-[0.65rem] text-muted">Status</span>
          <p className="mt-3 text-sm">{label}</p>
          {member && (
            <div className="mt-4">
              <ShareStoryButton item={item} variant="subtle" />
            </div>
          )}
        </div>
        <ManifestorPanel
          itemId={item.id}
          slug={item.slug}
          initialManifestors={manifestors}
          currentMemberId={member?.id ?? null}
          signedIn={Boolean(member)}
        />
        <div className="border-[1.5px] border-ink p-5">
          <span className="mono-label text-[0.65rem] text-muted">Interested</span>
          <p className="mt-3 text-sm">{item.memberCount} so far</p>
        </div>
      </section>

      {/* Chat feed */}
      <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 md:px-10">
        <h2 className="mb-8 text-lg font-extrabold uppercase">The brainstorm</h2>
        <ChatFeed
          manifestId={item.id}
          slug={item.slug}
          initialMessages={messages}
          signedIn={Boolean(member)}
        />
      </section>
    </SiteShell>
  );
}
