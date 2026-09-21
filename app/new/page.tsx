import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/current-member";
import { NewItemForm } from "./NewItemForm";

export default async function NewItemPage() {
  const member = await getCurrentMember();
  if (!member?.isAdmin) redirect("/");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b-[1.5px] border-ink px-6 py-5 md:px-10">
        <Link href="/" className="text-lg font-extrabold tracking-tight uppercase">
          SYLON
        </Link>
        <span className="mono-label text-[0.65rem] text-muted">New plan</span>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12 md:px-0">
        <h1 className="mb-2 text-4xl font-extrabold uppercase leading-none">Add a plan</h1>
        <p className="mb-10 text-sm leading-snug text-muted">
          A Trip is a real, dated plan. A Manifest is still just an idea people can vote on.
        </p>
        <NewItemForm />
      </div>
    </div>
  );
}
