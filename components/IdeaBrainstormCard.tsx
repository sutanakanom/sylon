"use client";

import { useState, useTransition } from "react";
import { ChatMessage, ChatTag } from "@/lib/types";
import { postChatMessage, toggleIdeaLike } from "@/app/actions/manifest";
import { useT } from "./LocaleProvider";
import styles from "@/app/SylonDesign.module.css";

type LikeInfo = { count: number; likedByMe: boolean };

// The brainstorm card, restyled onto the workspace grid — reuses the same
// chat_messages table as the old chat feed, filtered down to the two
// "idea" tags (date_idea / place_idea), with real per-member likes on
// top via chat_message_likes.
export function IdeaBrainstormCard({
  manifestId,
  slug,
  initialIdeas,
  initialLikes,
  signedIn,
}: {
  manifestId: string;
  slug: string;
  initialIdeas: ChatMessage[];
  initialLikes: Record<string, LikeInfo>;
  signedIn: boolean;
}) {
  const { t } = useT();
  const [ideas, setIdeas] = useState(initialIdeas);
  const [likes, setLikes] = useState(initialLikes);
  const [draft, setDraft] = useState("");
  const [tag, setTag] = useState<ChatTag>("place_idea");
  const [isPending, startTransition] = useTransition();

  function handleLike(id: string) {
    if (!signedIn) return;
    setLikes((prev) => {
      const cur = prev[id] ?? { count: 0, likedByMe: false };
      return {
        ...prev,
        [id]: {
          count: cur.likedByMe ? Math.max(0, cur.count - 1) : cur.count + 1,
          likedByMe: !cur.likedByMe,
        },
      };
    });
    startTransition(async () => {
      const result = await toggleIdeaLike(id, slug);
      if (!result.ok) {
        // revert
        setLikes((prev) => {
          const cur = prev[id] ?? { count: 0, likedByMe: false };
          return {
            ...prev,
            [id]: {
              count: cur.likedByMe ? Math.max(0, cur.count - 1) : cur.count + 1,
              likedByMe: !cur.likedByMe,
            },
          };
        });
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    const body = draft;
    const chosenTag = tag;
    setDraft("");
    startTransition(async () => {
      const result = await postChatMessage(manifestId, slug, chosenTag, body);
      if (result.ok) {
        setIdeas((prev) => [
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
      }
    });
  }

  return (
    <>
      {ideas.length === 0 && <p className="mt-4 text-sm" style={{ opacity: 0.7 }}>{t("manifestDetail.noIdeasYet")}</p>}
      {ideas.map((idea) => {
        const like = likes[idea.id] ?? { count: 0, likedByMe: false };
        return (
          <div key={idea.id} className={styles.idea}>
            <b className="mono" style={{ fontSize: "0.7rem" }}>{idea.memberName.slice(0, 2).toUpperCase()}</b>
            <div>
              <p>{idea.body}</p>
              <small>
                {idea.tag === "date_idea" ? t("manifestDetail.dateIdea") : t("manifestDetail.placeIdea")} ·{" "}
                {idea.memberName}
              </small>
            </div>
            <button
              type="button"
              className={styles.ideaLike}
              onClick={() => handleLike(idea.id)}
              disabled={!signedIn}
            >
              ♥ {like.count}
            </button>
          </div>
        );
      })}

      {signedIn ? (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTag("place_idea")}
              className="mono-label border-[1.5px] border-ink px-2 py-1 text-[0.6rem]"
              style={{ background: tag === "place_idea" ? "var(--ink)" : "transparent", color: tag === "place_idea" ? "var(--paper)" : "inherit" }}
            >
              {t("manifestDetail.placeIdea")}
            </button>
            <button
              type="button"
              onClick={() => setTag("date_idea")}
              className="mono-label border-[1.5px] border-ink px-2 py-1 text-[0.6rem]"
              style={{ background: tag === "date_idea" ? "var(--ink)" : "transparent", color: tag === "date_idea" ? "var(--paper)" : "inherit" }}
            >
              {t("manifestDetail.dateIdea")}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("manifestDetail.dropAnIdea")}
              className="flex-1 border-[1.5px] border-ink bg-paper px-2 py-1.5 text-sm outline-none"
            />
            <button type="submit" disabled={isPending || !draft.trim()} className={styles.submitSmall}>
              {t("common.post")}
            </button>
          </div>
        </form>
      ) : (
        <a href="/sign-in" className={styles.submitSmall} style={{ display: "inline-block" }}>
          {t("manifestDetail.signInToAddIdea")}
        </a>
      )}
    </>
  );
}
