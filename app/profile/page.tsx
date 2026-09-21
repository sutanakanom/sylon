import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/current-member";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const member = await getCurrentMember();
  if (!member) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b-[1.5px] border-ink px-6 py-5 md:px-10">
        <Link href="/" className="text-lg font-extrabold tracking-tight uppercase">
          SYLON
        </Link>
        <span className="mono-label text-[0.65rem] text-muted">Your profile</span>
      </header>

      <div className="mx-auto w-full max-w-md flex-1 px-6 py-12 md:px-0">
        <h1 className="mb-2 text-4xl font-extrabold uppercase leading-none">Profile</h1>
        <p className="mb-10 text-sm leading-snug text-muted">
          Shown on your page and next to your comments — never your email.
        </p>
        <ProfileForm member={member} />
      </div>
    </div>
  );
}
