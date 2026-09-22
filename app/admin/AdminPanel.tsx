"use client";

import { useState, useTransition } from "react";
import {
  AdminMemberRow,
  AdminInviteRequestRow,
  AdminSignupRequestRow,
  inviteMember,
  regenerateCode,
  deactivateMember,
  reactivateMember,
  approveInviteRequest,
  dismissInviteRequest,
  approveSignupRequest,
  dismissSignupRequest,
  setMemberHandle,
} from "@/app/actions/admin";

export function AdminPanel({
  initialMembers,
  initialRequests,
  initialSignupRequests,
}: {
  initialMembers: AdminMemberRow[];
  initialRequests: AdminInviteRequestRow[];
  initialSignupRequests: AdminSignupRequestRow[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [requests, setRequests] = useState(initialRequests);
  const [signupRequests, setSignupRequests] = useState(initialSignupRequests);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [handleDrafts, setHandleDrafts] = useState<Record<string, string>>({});

  function handleApprove(request: AdminInviteRequestRow) {
    setError(null);
    setStatus(null);
    setBusyId(request.id);
    startTransition(async () => {
      const result = await approveInviteRequest(request.id, request.email);
      setBusyId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      setStatus(`Invite sent to ${request.email}.`);
      if (!members.some((m) => m.email === request.email)) {
        setMembers((prev) => [
          {
            id: `pending-${request.email}`,
            email: request.email,
            displayName: null,
            handle: null,
            deactivated: false,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    });
  }

  function handleDismiss(request: AdminInviteRequestRow) {
    setBusyId(request.id);
    startTransition(async () => {
      await dismissInviteRequest(request.id);
      setBusyId(null);
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
    });
  }

  function handleApproveSignup(request: AdminSignupRequestRow) {
    setError(null);
    setStatus(null);
    setBusyId(request.id);
    startTransition(async () => {
      const result = await approveSignupRequest(request.id, request.email);
      setBusyId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSignupRequests((prev) => prev.filter((r) => r.id !== request.id));
      setStatus(`Invite sent to ${request.email}.`);
      if (!members.some((m) => m.email === request.email)) {
        setMembers((prev) => [
          {
            id: `pending-${request.email}`,
            email: request.email,
            displayName: null,
            handle: null,
            deactivated: false,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    });
  }

  function handleDismissSignup(request: AdminSignupRequestRow) {
    setBusyId(request.id);
    startTransition(async () => {
      await dismissSignupRequest(request.id);
      setBusyId(null);
      setSignupRequests((prev) => prev.filter((r) => r.id !== request.id));
    });
  }

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
            handle: null,
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

  function handleSetHandle(m: AdminMemberRow) {
    const draft = (handleDrafts[m.id] ?? m.handle ?? "").trim();
    if (!draft) return;
    setError(null);
    setStatus(null);
    setBusyId(`handle-${m.id}`);
    startTransition(async () => {
      const result = await setMemberHandle(m.id, draft);
      setBusyId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMembers((prev) =>
        prev.map((row) =>
          row.id === m.id
            ? { ...row, handle: draft.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "") }
            : row
        )
      );
      setStatus(`${m.email} is now @${draft}.`);
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
      {requests.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="mono-label text-[0.7rem] text-muted">
            Requests ({requests.length})
          </span>
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 border-[1.5px] border-ink bg-acid p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {r.name} · <span className="text-sm">{r.email}</span>
                </p>
                {r.reason && (
                  <p className="mono-label text-[0.65rem] opacity-70">{r.reason}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isPending && busyId === r.id}
                  onClick={() => handleApprove(r)}
                  className="mono-label border-[1.5px] border-ink bg-paper px-3 py-2 text-[0.65rem] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--ink)] disabled:opacity-50"
                >
                  {busyId === r.id && isPending ? "…" : "Send invite"}
                </button>
                <button
                  type="button"
                  disabled={isPending && busyId === r.id}
                  onClick={() => handleDismiss(r)}
                  className="mono-label border-[1.5px] border-ink px-3 py-2 text-[0.65rem] disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {signupRequests.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="mono-label text-[0.7rem] text-muted">
            Signup requests ({signupRequests.length})
          </span>
          {signupRequests.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 border-[1.5px] border-ink bg-orange p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="font-medium">{r.email}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isPending && busyId === r.id}
                  onClick={() => handleApproveSignup(r)}
                  className="mono-label border-[1.5px] border-ink bg-paper px-3 py-2 text-[0.65rem] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--ink)] disabled:opacity-50"
                >
                  {busyId === r.id && isPending ? "…" : "Approve"}
                </button>
                <button
                  type="button"
                  disabled={isPending && busyId === r.id}
                  onClick={() => handleDismissSignup(r)}
                  className="mono-label border-[1.5px] border-ink px-3 py-2 text-[0.65rem] disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                {m.handle ? `@${m.handle}` : "No handle — can't publish yet"} ·{" "}
                {m.deactivated ? "Deactivated" : "Active"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={handleDrafts[m.id] ?? m.handle ?? ""}
                  onChange={(e) =>
                    setHandleDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))
                  }
                  placeholder="handle"
                  className="border-[1.5px] border-ink bg-paper px-2 py-1 text-sm outline-none focus:shadow-[3px_3px_0_var(--ink)]"
                />
                <button
                  type="button"
                  disabled={isPending && busyId === `handle-${m.id}`}
                  onClick={() => handleSetHandle(m)}
                  className="mono-label border-[1.5px] border-ink px-3 py-1.5 text-[0.65rem] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--ink)] disabled:opacity-50"
                >
                  {busyId === `handle-${m.id}` && isPending ? "Saving…" : "Set handle"}
                </button>
              </div>
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
