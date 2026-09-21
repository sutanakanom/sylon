import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/current-member";
import { SiteShell } from "@/components/SiteShell";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const member = await getCurrentMember();
  if (!member) redirect("/sign-in");

  return (
    <SiteShell member={member} centerLabel="Your profile">
      <div className="mx-auto w-full max-w-md flex-1 px-6 py-12 md:px-0">
        <h1 className="mb-2 text-4xl font-extrabold uppercase leading-none">Profile</h1>
        <p className="mb-10 text-sm leading-snug text-muted">
          Shown on your page and next to your comments — never your email.
        </p>
        <ProfileForm member={member} />
      </div>
    </SiteShell>
  );
}
