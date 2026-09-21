"use client";

import { useState, useTransition } from "react";
import { ChatMessage, ChatTag, CHAT_TAG_LABEL } from "@/lib/types";
import { postChatMessage } from "@/app/actions/manifest";

const TAGS: ChatTag[] = ["date_idea", "place_idea", "im_in", "note"];

const TAG_COLOR: Record<ChatTag, string> = {
  date_idea: "bg-orange text-ink",
  place_idea: "bg-acid text-ink",
  im_in: "bg-ink text-acid",
  note: "bg-paper text-muted",
};

export function ChatFeed({
  manifestId,
  slug,
  initialMessages,
  signedIn,
}: {
  manifestId: string;
  slug: string;
  initialMessages: ChatMessage[];
  signedIn: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [tag, setTag] = useState<ChatTag>("note");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <p className="text-sm text-muted">
        <a href="/sign-in" className="underline underline-offset-2">
          Sign in
        </a>{" "}
        to see and join the brainstorm.
      </p>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body = draft;
    const chosenTag = tag;
    startTransition(async () => {
      const result = await postChatMessage(manifestId, slug, chosenTag, body);
      if (result.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `optimistic-${Date.now()}`,
            manifestId,
            memberId: "me",
            memberName: "You",
            tag: chosenTag,
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

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 && (
        <p className="text-sm text-muted">No ideas yet — drop the first one.</p>
      )}
      {messages.map((m) => (
        <div key={m.id} className="border-l-2 border-ink pl-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold uppercase">{m.memberName}</span>
            <span
              className={`mono-label rounded-full border border-current px-2 py-0.5 text-[0.6rem] ${TAG_COLOR[m.tag]}`}
            >
              {CHAT_TAG_LABEL[m.tag]}
            </span>
          </div>
          <p className="text-sm leading-snug">{m.body}</p>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTag(t)}
              className={`mono-label border-[1.5px] border-ink px-2.5 py-1 text-[0.65rem] ${
                tag === t ? TAG_COLOR[t] : "bg-transparent"
              }`}
            >
              {CHAT_TAG_LABEL[t]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Drop an idea…"
            className="flex-1 border-[1.5px] border-ink bg-paper px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--ink)]"
          />
          <button
            type="submit"
            disabled={isPending || !draft.trim()}
            className="mono-label border-[1.5px] border-ink bg-ink px-4 py-2 text-[0.7rem] text-paper disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </form>
      {error && <p className="text-sm text-orange">{error}</p>}
    </div>
  );
}
