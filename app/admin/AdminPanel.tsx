"use client";

import { useState, useTransition } from "react";
import {
  AdminMemberRow,
  inviteMember,
  regenerateCode,
  deactivateMember,
  reactivateMember,
} from "@/app/actions/admin";

export function AdminPanel({ initialMembers }: { initialMembers: AdminMemberRow[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    const cleanEmail = email.trim().toLowerCase();
    startTransition(async () => {
      const result = await inviteMember(cleanEmail);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus(`Invite sent to ${cleanEmail}.`);
      setEmail("");
      if (!members.some((m) => m.email === cleanEmail)) {
        setMembers((prev) => [
          {
            id: `pending-${cleanEmail}`,
            email: cleanEmail,
            displayName: null,
            deactivated: false,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    });
  }

  function handleRegenerate(memberEmail: string) {
    setError(null);
    setStatus(null);
    setBusyId(memberEmail);
    startTransition(async () => {
      const result = await regenerateCode(memberEmail);
      setBusyId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus(`New code sent to ${memberEmail}.`);
    });
  }

  function handleToggle(m: AdminMemberRow) {
    setError(null);
    setStatus(null);
    setBusyId(m.id);
    startTransition(async () => {
      const result = m.deactivated ? await reactivateMember(m.id) : await deactivateMember(m.id);
      setBusyId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMembers((prev) =>
        prev.map((row) => (row.id === m.id ? { ...row, deactivated: !m.deactivated } : row))
      );
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <form
        onSubmit={handleInvite}
        className="flex flex-col gap-4 border-[1.5px] border-ink bg-paper p-6 shadow-[6px_6px_0_var(--ink)]"
      >
        <label className="flex flex-col gap-2">
          <span className="mono-label text-[0.7rem] text-muted">Invite by email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com"
            className="border-[1.5px] border-ink bg-paper px-4 py-3 text-base outline-none focus:shadow-[4px_4px_0_var(--ink)]"
          />
        </label>
        {error && <p className="text-sm text-orange">{error}</p>}
        {status && <p className="text-sm text-ink">{status}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="mono-label self-start border-[1.5px] border-ink bg-acid px-5 py-3 text-[0.75rem] text-ink transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
        >
          {isPending ? "Sending…" : "Send invite"}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {members.length === 0 && (
          <p className="text-sm text-muted">No one&apos;s been invited yet.</p>
        )}
        {members.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-3 border-[1.5px] border-ink p-4 sm:flex-row sm:items-center sm:justify-between ${
              m.deactivated ? "bg-paper opacity-60" : "bg-paper"
            }`}
          >
            <div>
              <p className="font-medium">{m.email}</p>
              <p className="mono-label text-[0.65rem] text-muted">
                {m.displayName ?? "No display name yet"} ·{" "}
                {m.deactivated ? "Deactivated" : "Active"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isPending && busyId === m.email}
                onClick={() => handleRegenerate(m.email)}
                className="mono-label border-[1.5px] border-ink px-3 py-2 text-[0.65rem] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--ink)] disabled:opacity-50"
              >
                {busyId === m.email && isPending ? "Sending…" : "New code"}
              </button>
              <button
                type="button"
                disabled={isPending && busyId === m.id}
                onClick={() => handleToggle(m)}
                className={`mono-label border-[1.5px] border-ink px-3 py-2 text-[0.65rem] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--ink)] disabled:opacity-50 ${
                  m.deactivated ? "bg-acid" : "bg-orange"
                }`}
              >
                {busyId === m.id && isPending
                  ? "…"
                  : m.deactivated
                    ? "Reactivate"
                    : "Deactivate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
