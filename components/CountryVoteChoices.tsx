"use client";

import { useState, useTransition } from "react";
import { voteCountry } from "@/app/actions/manifest";
import { useT } from "./LocaleProvider";
import styles from "@/app/SylonDesign.module.css";

// Real click-to-vote: one vote per signed-in member, changeable any
// time. Signed-out visitors see the same bars but the buttons just send
// them to sign in — voting is member-only, like joining and commenting.
export function CountryVoteChoices({
  manifestId,
  slug,
  options,
  initialVote,
  signedIn,
}: {
  manifestId: string;
  slug: string;
  options: { country: string; votes: number }[];
  initialVote: string | null;
  signedIn: boolean;
}) {
  const { t, tn } = useT();
  const [votes, setVotes] = useState(options);
  const [myVote, setMyVote] = useState(initialVote);
  const [isPending, startTransition] = useTransition();

  const total = votes.reduce((sum, v) => sum + v.votes, 0) || 1;

  if (!signedIn) {
    return (
      <div className={styles.voteChoices}>
        {votes.map((v) => (
          <div key={v.country} className={styles.voteChoice}>
            <strong>{v.country}</strong>
            <span className={`${styles.mini} mono`}>
              {tn(v.votes, { one: "vote", other: "votes" }, "โหวต")}
            </span>
            <span className={styles.voteBarTrack}>
              <span
                className={styles.voteBarFill}
                style={{ width: `${Math.round((v.votes / total) * 100)}%` }}
              />
            </span>
          </div>
        ))}
        <a href="/sign-in" className={`${styles.mini} mono underline underline-offset-2`}>
          {t("vote.signInToVote")}
        </a>
      </div>
    );
  }

  return (
    <div className={styles.voteChoices}>
      {votes.map((v) => (
        <button
          key={v.country}
          type="button"
          disabled={isPending}
          onClick={() => {
            const previousVote = myVote;
            setMyVote(v.country);
            setVotes((prev) =>
              prev.map((option) => {
                if (option.country === v.country) return { ...option, votes: option.votes + 1 };
                if (option.country === previousVote) return { ...option, votes: Math.max(0, option.votes - 1) };
                return option;
              })
            );
            startTransition(async () => {
              const result = await voteCountry(manifestId, slug, v.country);
              if (!result.ok) {
                // Revert the optimistic update on failure.
                setMyVote(previousVote);
                setVotes(options);
              }
            });
          }}
          className={`${styles.voteChoice} ${v.country === myVote ? styles.voteChoiceActive : ""}`}
        >
          <strong>{v.country}</strong>
          <span className={`${styles.mini} mono`}>
            {tn(v.votes, { one: "vote", other: "votes" }, "โหวต")}
          </span>
          <span className={styles.voteBarTrack}>
            <span
              className={styles.voteBarFill}
              style={{ width: `${Math.round((v.votes / total) * 100)}%` }}
            />
          </span>
        </button>
      ))}
    </div>
  );
}
