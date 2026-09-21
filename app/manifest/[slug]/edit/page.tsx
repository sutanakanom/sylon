import { notFound, redirect } from "next/navigation";
import { getItemBySlug } from "@/lib/data";
import { getCurrentMember } from "@/lib/current-member";
import { SiteShell } from "@/components/SiteShell";
import { EditManifestForm } from "./EditManifestForm";

export default async function EditManifestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item || item.kind !== "manifest") notFound();

  const member = await getCurrentMember();
  // Only the page owner can edit their own manifest — not just any host,
  // and not the system-admin flag (see requireItemOwner in items.ts).
  if (!member?.handle || member.handle !== item.ownerHandle) {
    redirect(`/manifest/${slug}`);
  }

  return (
    <SiteShell member={member} centerLabel={`Editing ${item.title}`}>
      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12 md:px-0">
        <h1 className="mb-2 text-4xl font-extrabold uppercase leading-none">Edit manifest</h1>
        <p className="mb-10 text-sm leading-snug text-muted">
          Change what&apos;s public, decide the location, set target dates, or write the
          latest take.
        </p>
        <EditManifestForm item={item} />
      </div>
    </SiteShell>
  );
}
