"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Member } from "@/lib/current-member";
import { updateProfile } from "@/app/actions/profile";

export function ProfileForm({ member }: { member: Member }) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(member.photoUrl);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus("Saved.");
      router.refresh();
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Your avatar"
            className="h-20 w-20 rounded-[10px] border-[1.5px] border-ink object-cover shadow-[4px_4px_0_var(--acid)]"
          />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-[10px] border-[1.5px] border-ink bg-ink text-2xl font-extrabold text-paper shadow-[4px_4px_0_var(--acid)]">
            {(member.displayName || member.email).charAt(0).toUpperCase()}
          </div>
        )}
        <label className="flex flex-col gap-2">
          <span className="mono-label text-[0.65rem] text-muted">Avatar photo (max 2MB)</span>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handlePhotoChange}
            className="text-sm"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="mono-label text-[0.7rem] text-muted">Display name</span>
        <input
          type="text"
          name="displayName"
          defaultValue={member.displayName ?? ""}
          placeholder={member.email.split("@")[0]}
          className="border-[1.5px] border-ink bg-paper px-4 py-3 text-base outline-none focus:shadow-[4px_4px_0_var(--ink)]"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="mono-label text-[0.7rem] text-muted">Instagram handle</span>
        <div className="flex items-center border-[1.5px] border-ink bg-paper focus-within:shadow-[4px_4px_0_var(--ink)]">
          <span className="pl-4 text-muted">@</span>
          <input
            type="text"
            name="instagramHandle"
            defaultValue={member.instagramHandle ?? ""}
            placeholder="yourhandle"
            className="w-full bg-transparent px-2 py-3 text-base outline-none"
          />
        </div>
      </label>

      {error && <p className="text-sm text-orange">{error}</p>}
      {status && <p className="text-sm text-ink">{status}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mono-label self-start border-[1.5px] border-ink bg-acid px-6 py-3 text-[0.75rem] text-ink transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
