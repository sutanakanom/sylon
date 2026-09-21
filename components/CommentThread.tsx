"use client";

import { useState, useTransition } from "react";
import { Comment } from "@/lib/types";
import { postComment } from "@/app/actions/interactions";
import { useT } from "./LocaleProvider";

export function CommentThread({
  itemType,
  itemId,
  slug,
  initialComments,
  currentMemberName,
}: {
  itemType: "trip" | "manifest";
  itemId: string;
  slug: string;
  initialComments: Comment[];
  currentMemberName: string | null;
}) {
  const { t, locale } = useT();
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body = draft;
    const name = currentMemberName ?? "You";
    startTransition(async () => {
      const result = await postComment(itemType, itemId, slug, body);
      if (result.ok) {
        setComments((prev) => [
          ...prev,
          {
            id: `optimistic-${Date.now()}`,
            itemType,
            itemId,
            memberId: "me",
            memberName: name,
            body,
            createdAt: new Date().toISOString(),
          },
        ]);
        setDraft("");
      } else {
        setError(result.error);
      }
    });
  }

  if (!currentMemberName) {
    return (
      <p className="text-sm text-muted">
        <a href="/sign-in" className="underline underline-offset-2">
          {t("comments.signInToJoin")}
        </a>{" "}
        {t("comments.signInToSeeAndJoin")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.length === 0 && <p className="text-sm text-muted">{t("comments.noneYet")}</p>}
      {comments.map((c) => (
        <div key={c.id} className="border-l-2 border-ink pl-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold uppercase">{c.memberName}</span>
            <span className="mono-label text-[0.6rem] text-muted">
              {new Date(c.createdAt).toLocaleDateString(locale === "th" ? "th-TH" : undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <p className="text-sm leading-snug">{c.body}</p>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("comments.placeholder")}
          className="flex-1 border-[1.5px] border-ink bg-paper px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--ink)]"
        />
        <button
          type="submit"
          disabled={isPending || !draft.trim()}
          className="mono-label border-[1.5px] border-ink bg-ink px-4 py-2 text-[0.7rem] text-paper disabled:opacity-50"
        >
          {t("comments.post")}
        </button>
      </form>
      {error && <p className="text-sm text-orange">{error}</p>}
    </div>
  );
}
