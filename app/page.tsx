import Link from "next/link";
import { getCurrentMember } from "@/lib/current-member";
import { ProfileChip } from "@/components/ProfileChip";
import { signOut } from "@/app/actions/auth";

// Generic landing page. v1 only has one host (Kanom), so this mostly
// exists to set the tone and point somewhere real — once the platform
// opens to other hosts (a later, non-v1 step per the requirements doc),
// this is where new hosts would sign up and existing pages get listed.
export default async function LandingPage() {
  const member = await getCurrentMember();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b-[1.5px] border-ink px-6 py-5 md:px-10">
        <span className="text-lg font-extrabold tracking-tight uppercase">SYLON</span>
        {member ? (
          <div className="flex items-center gap-4">
            {member.isAdmin && (
              <Link
                href="/admin"
                className="mono-label text-[0.65rem] text-muted underline underline-offset-2"
              >
                Admin
              </Link>
            )}
            <Link href="/profile">
              <ProfileChip member={member} />
            </Link>
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
            What is our password?
          </a>
        )}
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center md:px-10">
        <div>
          <h1 className="text-6xl font-extrabold leading-[0.95] tracking-tight uppercase md:text-8xl">
            See you
            <br />
            later.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg leading-snug text-muted">
            Or maybe not. A place for sharing the trips you&apos;re actually planning —
            and the ones that are still just a maybe.
          </p>
        </div>

        <Link
          href="/kanom"
          className="mono-label border-[1.5px] border-ink bg-acid px-6 py-4 text-[0.8rem] text-ink transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--ink)]"
        >
          See Kanom&apos;s plans ↗
        </Link>
      </section>

      <section className="border-t-[1.5px] border-ink bg-ink px-6 py-16 text-center text-paper md:px-10">
        <p className="mx-auto max-w-2xl text-xl font-medium leading-snug md:text-2xl">
          Not every plan is a promise. Some are just a place we haven&apos;t been yet —
          and an open invitation to whoever wants to help make it real.
        </p>
      </section>

      <footer className="mt-auto flex flex-col items-center gap-1 px-6 py-8 text-center">
        <span className="mono-label text-[0.65rem] text-footer-grey">
          SYLON — See You Later (or not)
        </span>
      </footer>
    </div>
  );
}
