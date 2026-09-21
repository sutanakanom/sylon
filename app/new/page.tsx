import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/current-member";
import { SiteShell } from "@/components/SiteShell";
import { NewItemForm } from "./NewItemForm";

export default async function NewItemPage() {
  const member = await getCurrentMember();
  if (!member?.handle) redirect("/");

  return (
    <SiteShell member={member} centerLabel="New plan">
      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12 md:px-0">
        <h1 className="mb-2 text-4xl font-extrabold uppercase leading-none">Add a plan</h1>
        <p className="mb-10 text-sm leading-snug text-muted">
          A Trip is a real, dated plan. A Manifest is still just an idea people can vote on.
        </p>
        <NewItemForm />
      </div>
    </SiteShell>
  );
}
