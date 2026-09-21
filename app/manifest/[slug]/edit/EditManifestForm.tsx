"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateManifest } from "@/app/actions/items";
import { Manifest, SignalItem, Visibility } from "@/lib/types";
import { useT } from "@/components/LocaleProvider";

const inputClass =
  "border-[1.5px] border-ink bg-paper px-4 py-3 text-base outline-none focus:shadow-[4px_4px_0_var(--ink)]";
const labelClass = "mono-label text-[0.7rem] text-muted";

export function EditManifestForm({ item }: { item: Manifest }) {
  const router = useRouter();
  const { t } = useT();

  const [title, setTitle] = useState(item.title);
  const [purpose, setPurpose] = useState(item.purpose ?? "");
  const [roughDate, setRoughDate] = useState(item.roughDate);
  const [countries, setCountries] = useState(item.countryVotes.map((v) => v.country).join(", "));
  const [summary, setSummary] = useState(item.summary);
  const [visibility, setVisibility] = useState<Visibility>(item.visibility);

  const [realityFundPercent, setRealityFundPercent] = useState(
    item.realityFundPercent !== null ? String(item.realityFundPercent) : ""
  );
  const [signals, setSignals] = useState<SignalItem[]>(item.signals);
  const [signalTitleDraft, setSignalTitleDraft] = useState("");
  const [signalBodyDraft, setSignalBodyDraft] = useState("");

  const [noteQuote, setNoteQuote] = useState(item.noteQuote ?? "");
  const [noteAuthor, setNoteAuthor] = useState(item.noteAuthor ?? "");

  // Collaborative-idea anchors.
  const [availabilityWindows, setAvailabilityWindows] = useState<string[]>(item.availabilityWindows);
  const [windowDraft, setWindowDraft] = useState("");
  const [decidedCountry, setDecidedCountry] = useState(item.decidedCountry ?? "");
  const [targetStartDate, setTargetStartDate] = useState(item.targetStartDate ?? "");
  const [targetEndDate, setTargetEndDate] = useState(item.targetEndDate ?? "");
  const [summaryHeadline, setSummaryHeadline] = useState(item.creatorSummaryHeadline ?? "");
  const [summaryBody, setSummaryBody] = useState(item.creatorSummaryBody ?? "");
  const [summaryTags, setSummaryTags] = useState(item.creatorSummaryTags.join(", "));

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addSignal() {
    if (!signalTitleDraft.trim()) return;
    setSignals((prev) => [...prev, { title: signalTitleDraft.trim(), body: signalBodyDraft.trim() }]);
    setSignalTitleDraft("");
    setSignalBodyDraft("");
  }

  function removeSignal(index: number) {
    setSignals((prev) => prev.filter((_, i) => i !== index));
  }

  function addWindow() {
    if (!windowDraft.trim()) return;
    setAvailabilityWindows((prev) => [...prev, windowDraft.trim()]);
    setWindowDraft("");
  }

  function removeWindow(index: number) {
    setAvailabilityWindows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const countryList = countries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const result = await updateManifest(item.id, item.slug, {
        title,
        purpose,
        roughDate,
        countryOptions: countryList,
        summary,
        visibility,
        signals,
        realityFundPercent: realityFundPercent.trim() ? Number(realityFundPercent) : null,
        noteQuote,
        noteAuthor,
        availabilityWindows,
        decidedCountry,
        targetStartDate,
        targetEndDate,
        creatorSummaryHeadline: summaryHeadline,
        creatorSummaryBody: summaryBody,
        creatorSummaryTags: summaryTags.split(",").map((tag) => tag.trim()),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/manifest/${result.slug}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className={labelClass}>{t("manifestEdit.titleField")}</span>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>{t("manifestEdit.purpose")}</span>
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder={t("manifestEdit.purposePlaceholder")}
          className={inputClass}
        />
        <span className="text-xs text-muted">{t("manifestEdit.purposeHint")}</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>{t("manifestEdit.roughTiming")}</span>
        <input
          type="text"
          value={roughDate}
          onChange={(e) => setRoughDate(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>{t("manifestEdit.countries")}</span>
        <input
          type="text"
          value={countries}
          onChange={(e) => setCountries(e.target.value)}
          className={inputClass}
        />
        <span className="text-xs text-muted">{t("manifestEdit.countriesHint")}</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>{t("manifestEdit.summary")}</span>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>{t("manifestEdit.visibility")}</span>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          className={inputClass}
        >
          <option value="invite-only">{t("common.inviteOnly")}</option>
          <option value="public">{t("common.public")}</option>
        </select>
      </label>

      <div className="border-t-[1.5px] border-ink pt-6">
        <h2 className="mb-1 text-lg font-extrabold uppercase">{t("manifestEdit.whatWeKnow")}</h2>
        <p className="mb-4 text-sm text-muted">{t("manifestEdit.whatWeKnowHint")}</p>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>{t("manifestEdit.decidedLocation")}</span>
          <select
            value={decidedCountry}
            onChange={(e) => setDecidedCountry(e.target.value)}
            className={inputClass}
          >
            <option value="">{t("manifestEdit.notDecidedYet")}</option>
            {countries
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </label>

        <div className="mt-4 flex gap-4">
          <label className="flex flex-1 flex-col gap-2">
            <span className={labelClass}>{t("manifestEdit.targetStartDate")}</span>
            <input
              type="date"
              value={targetStartDate}
              onChange={(e) => setTargetStartDate(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-1 flex-col gap-2">
            <span className={labelClass}>{t("manifestEdit.targetEndDate")}</span>
            <input
              type="date"
              value={targetEndDate}
              onChange={(e) => setTargetEndDate(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <span className={labelClass}>{t("manifestEdit.availabilityWindows")}</span>
          {availabilityWindows.length > 0 && (
            <ul className="flex flex-col gap-2">
              {availabilityWindows.map((w, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between border-[1.5px] border-ink px-4 py-2 text-sm"
                >
                  {w}
                  <button
                    type="button"
                    onClick={() => removeWindow(i)}
                    className="mono-label text-[0.6rem] text-muted underline underline-offset-2"
                  >
                    {t("common.remove")}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={windowDraft}
              onChange={(e) => setWindowDraft(e.target.value)}
              placeholder={t("manifestEdit.availabilityPlaceholder")}
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={addWindow}
              className="mono-label border-[1.5px] border-ink px-4 text-[0.65rem]"
            >
              {t("common.add")}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t-[1.5px] border-ink pt-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">{t("manifestEdit.latestSummary")}</h2>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className={labelClass}>{t("manifestEdit.headline")}</span>
            <input
              type="text"
              value={summaryHeadline}
              onChange={(e) => setSummaryHeadline(e.target.value)}
              placeholder={t("manifestEdit.headlinePlaceholder")}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>{t("manifestEdit.body")}</span>
            <textarea
              value={summaryBody}
              onChange={(e) => setSummaryBody(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>{t("manifestEdit.tags")}</span>
            <input
              type="text"
              value={summaryTags}
              onChange={(e) => setSummaryTags(e.target.value)}
              placeholder={t("manifestEdit.tagsPlaceholder")}
              className={inputClass}
            />
            <span className="text-xs text-muted">{t("common.commaSeparated")}</span>
          </label>
        </div>
      </div>

      <div className="border-t-[1.5px] border-ink pt-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">{t("manifestEdit.signsOfLife")}</h2>
        {signals.length > 0 && (
          <ul className="mb-3 flex flex-col gap-2">
            {signals.map((s, i) => (
              <li key={i} className="border-[1.5px] border-ink p-4 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <strong>{s.title}</strong>
                  <button
                    type="button"
                    onClick={() => removeSignal(i)}
                    className="mono-label shrink-0 text-[0.6rem] text-muted underline underline-offset-2"
                  >
                    {t("common.remove")}
                  </button>
                </div>
                {s.body && <p className="mt-1 text-muted">{s.body}</p>}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col gap-2 border-[1.5px] border-ink p-4">
          <input
            type="text"
            value={signalTitleDraft}
            onChange={(e) => setSignalTitleDraft(e.target.value)}
            placeholder={t("manifestEdit.signalTitlePlaceholder")}
            className={inputClass}
          />
          <input
            type="text"
            value={signalBodyDraft}
            onChange={(e) => setSignalBodyDraft(e.target.value)}
            placeholder={t("manifestEdit.signalBodyPlaceholder")}
            className={inputClass}
          />
          <button
            type="button"
            onClick={addSignal}
            className="mono-label self-start border-[1.5px] border-ink px-4 py-2 text-[0.65rem]"
          >
            {t("manifestEdit.addSignal")}
          </button>
        </div>
      </div>

      <div className="border-t-[1.5px] border-ink pt-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">{t("manifestEdit.realityFundAndNote")}</h2>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className={labelClass}>{t("manifestEdit.realityFund")}</span>
            <input
              type="number"
              min={0}
              max={100}
              value={realityFundPercent}
              onChange={(e) => setRealityFundPercent(e.target.value)}
              className={inputClass}
            />
          </label>
          <div className="flex gap-4">
            <label className="flex flex-1 flex-col gap-2">
              <span className={labelClass}>{t("manifestEdit.note")}</span>
              <input
                type="text"
                value={noteQuote}
                onChange={(e) => setNoteQuote(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-1 flex-col gap-2">
              <span className={labelClass}>{t("manifestEdit.attributedTo")}</span>
              <input
                type="text"
                value={noteAuthor}
                onChange={(e) => setNoteAuthor(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-orange">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="mono-label border-[1.5px] border-ink bg-acid px-6 py-3 text-[0.75rem] text-ink transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
        >
          {isPending ? t("manifestEdit.saving") : t("manifestEdit.saveChanges")}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/manifest/${item.slug}`)}
          className="mono-label border-[1.5px] border-ink px-6 py-3 text-[0.75rem]"
        >
          {t("manifestEdit.cancel")}
        </button>
      </div>
    </form>
  );
}
