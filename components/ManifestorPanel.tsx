"use client";

import { useState, useTransition } from "react";
import { Manifestor } from "@/lib/types";
import { becomeManifestor, nominateManifestor, removeManifestor } from "@/app/actions/manifest";

export function ManifestorPanel({
  itemId,
  slug,
  initialManifestors,
  currentMemberId,
  signedIn,
}: {
  itemId: string;
  slug: string;
  initialManifestors: Manifestor[];
  currentMemberId: string | null;
  signedIn: boolean;
}) {
  const [manifestors, setManifestors] = useState(initialManifestors);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const iAmManifestor = manifestors.some((m) => m.id === currentMemberId);

  if (manifestors.length === 0) {
    return (
      <div className="border-[1.5px] border-ink p-5">
        <span className="mono-label text-[0.65rem] text-muted">Manifestors</span>
        <p className="mt-3 text-sm text-muted">Nobody&apos;s claimed this one yet.</p>
        {signedIn && (
          <button
            onClick={() =>
              startTransition(async () => {
                const result = await becomeManifestor(itemId, slug);
                if (!result.ok) setError(result.error);
              })
            }
            disabled={isPending}
            className="mono-label mt-3 border-[1.5px] border-ink bg-acid px-3 py-1.5 text-[0.7rem] text-ink disabled:opacity-50"
          >
            I&apos;ll manifest this
          </button>
        )}
        {error && <p className="mt-2 text-sm text-orange">{error}</p>}
      </div>
    );
  }

  return (
    <div className="border-[1.5px] border-ink p-5">
      <span className="mono-label text-[0.65rem] text-muted">
        Manifestors — equal power
      </span>
      <ul className="mt-3 flex flex-col gap-1.5">
        {manifestors.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold uppercase">{m.name}</span>
            {iAmManifestor && (
              <button
                onClick={() =>
                  startTransition(async () => {
                    const result = await removeManifestor(itemId, slug, m.id);
                    if (result.ok) {
                      setManifestors((prev) => prev.filter((x) => x.id !== m.id));
                    } else {
                      setError(result.error);
                    }
                  })
                }
                disabled={isPending}
                className="mono-label text-[0.6rem] text-muted underline underline-offset-2 disabled:opacity-50"
              >
                remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {iAmManifestor && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            startTransition(async () => {
              const result = await nominateManifestor(itemId, slug, email);
              if (result.ok) {
                setEmail("");
              } else {
                setError(result.error);
              }
            });
          }}
          className="mt-4 flex gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nominate by email"
            className="flex-1 border-[1.5px] border-ink bg-paper px-2 py-1.5 text-xs outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="mono-label border-[1.5px] border-ink px-3 py-1.5 text-[0.65rem] disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-orange">{error}</p>}
    </div>
  );
}
