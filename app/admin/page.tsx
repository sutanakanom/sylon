import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentMember } from "@/lib/current-member";
import { listMembers, listInviteRequests } from "@/app/actions/admin";
import { AdminPanel } from "./AdminPanel";

export default async function AdminPage() {
  const member = await getCurrentMember();
  if (!member?.isAdmin) notFound();

  const [members, requests] = await Promise.all([listMembers(), listInviteRequests()]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b-[1.5px] border-ink px-6 py-5 md:px-10">
        <Link href="/" className="text-lg font-extrabold tracking-tight uppercase">
          SYLON
        </Link>
        <span className="mono-label text-[0.65rem] text-muted">Admin</span>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 md:px-0">
        <h1 className="mb-2 text-4xl font-extrabold uppercase leading-none">Users</h1>
        <p className="mb-10 text-sm leading-snug text-muted">
          Invite someone by email, send a fresh code, or turn off an account&apos;s access.
        </p>
        <AdminPanel initialMembers={members} initialRequests={requests} />
      </div>
    </div>
  );
}
