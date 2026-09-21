"use client";

import { useState, useTransition } from "react";
import { submitSurvey, SurveyAnswers } from "@/app/actions/survey";
import { useT } from "./LocaleProvider";

export function SurveyForm({
  tripId,
  slug,
  initialAnswers,
}: {
  tripId: string;
  slug: string;
  initialAnswers: SurveyAnswers | null;
}) {
  const { t } = useT();
  const [inOrOut, setInOrOut] = useState<SurveyAnswers["inOrOut"]>(
    initialAnswers?.inOrOut ?? "in"
  );
  const [conflicts, setConflicts] = useState(initialAnswers?.conflicts ?? "");
  const [needs, setNeeds] = useState(initialAnswers?.needs ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const OPTION_LABEL: Record<SurveyAnswers["inOrOut"], string> = {
    in: t("survey.optionIn"),
    maybe: t("survey.optionMaybe"),
    out: t("survey.optionOut"),
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await submitSurvey(tripId, slug, { inOrOut, conflicts, needs });
      if (result.ok) {
        setSaved(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 border-[1.5px] border-ink p-5">
      <div>
        <span className="mono-label text-[0.65rem] text-muted">{t("survey.areYouIn")}</span>
        <div className="mt-2 flex gap-2">
          {(["in", "maybe", "out"] as const).map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setInOrOut(option)}
              className={`mono-label border-[1.5px] border-ink px-3 py-1.5 text-[0.7rem] ${
                inOrOut === option ? "bg-acid text-ink" : "bg-transparent"
              }`}
            >
              {OPTION_LABEL[option]}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="mono-label text-[0.65rem] text-muted">{t("survey.dateConflicts")}</span>
        <textarea
          value={conflicts}
          onChange={(e) => setConflicts(e.target.value)}
          rows={2}
          className="border-[1.5px] border-ink bg-paper px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--ink)]"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="mono-label text-[0.65rem] text-muted">{t("survey.needsFromGroup")}</span>
        <textarea
          value={needs}
          onChange={(e) => setNeeds(e.target.value)}
          rows={2}
          className="border-[1.5px] border-ink bg-paper px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--ink)]"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="mono-label border-[1.5px] border-ink bg-ink px-4 py-2 text-[0.7rem] text-paper disabled:opacity-50"
        >
          {isPending ? t("survey.saving") : t("survey.saveAnswers")}
        </button>
        {saved && <span className="text-sm text-muted">{t("survey.saved")}</span>}
        {error && <span className="text-sm text-orange">{error}</span>}
      </div>
    </form>
  );
}
