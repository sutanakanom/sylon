"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTrip } from "@/app/actions/items";
import { ChecklistItem, Leg, Trip, TripStatus, Visibility } from "@/lib/types";
import { useT } from "@/components/LocaleProvider";

const inputClass =
  "border-[1.5px] border-ink bg-paper px-4 py-3 text-base outline-none focus:shadow-[4px_4px_0_var(--ink)]";
const labelClass = "mono-label text-[0.7rem] text-muted";

export function EditTripForm({ item }: { item: Trip }) {
  const router = useRouter();
  const { t } = useT();

  const [title, setTitle] = useState(item.title);
  const [roughDate, setRoughDate] = useState(item.roughDate);
  const [countries, setCountries] = useState(item.countries.join(", "));
  const [summary, setSummary] = useState(item.summary);
  const [visibility, setVisibility] = useState<Visibility>(item.visibility);
  const [status, setStatus] = useState<TripStatus>(item.status);

  const [legs, setLegs] = useState<Leg[]>(item.legs);
  const [legPlaceDraft, setLegPlaceDraft] = useState("");
  const [legStartDraft, setLegStartDraft] = useState("");
  const [legEndDraft, setLegEndDraft] = useState("");

  const [companionName, setCompanionName] = useState(item.companionName ?? "");
  const [mainEvent, setMainEvent] = useState(item.mainEvent ?? "");
  const [readinessPercent, setReadinessPercent] = useState(
    item.readinessPercent !== null ? String(item.readinessPercent) : ""
  );

  const [checklist, setChecklist] = useState<ChecklistItem[]>(item.checklist);
  const [checklistDraft, setChecklistDraft] = useState("");

  const [noteQuote, setNoteQuote] = useState(item.noteQuote ?? "");
  const [noteAuthor, setNoteAuthor] = useState(item.noteAuthor ?? "");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addLeg() {
    if (!legPlaceDraft.trim()) return;
    setLegs((prev) => [
      ...prev,
      { place: legPlaceDraft.trim(), startDate: legStartDraft, endDate: legEndDraft },
    ]);
    setLegPlaceDraft("");
    setLegStartDraft("");
    setLegEndDraft("");
  }

  function removeLeg(index: number) {
    setLegs((prev) => prev.filter((_, i) => i !== index));
  }

  function addChecklistItem() {
    if (!checklistDraft.trim()) return;
    setChecklist((prev) => [...prev, { label: checklistDraft.trim(), done: false }]);
    setChecklistDraft("");
  }

  function removeChecklistItem(index: number) {
    setChecklist((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const countryList = countries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const result = await updateTrip(item.id, item.slug, {
        title,
        roughDate,
        countries: countryList,
        legs,
        summary,
        visibility,
        status,
        companionName,
        mainEvent,
        checklist,
        readinessPercent: readinessPercent.trim() ? Number(readinessPercent) : null,
        noteQuote,
        noteAuthor,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/trip/${result.slug}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className={labelClass}>{t("tripEdit.titleField")}</span>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>{t("tripEdit.roughTiming")}</span>
        <input
          type="text"
          value={roughDate}
          onChange={(e) => setRoughDate(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>{t("tripEdit.countries")}</span>
        <input
          type="text"
          value={countries}
          onChange={(e) => setCountries(e.target.value)}
          className={inputClass}
        />
        <span className="text-xs text-muted">{t("tripEdit.countriesHint")}</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>{t("tripEdit.summary")}</span>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-2">
          <span className={labelClass}>{t("tripEdit.visibility")}</span>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className={inputClass}
          >
            <option value="invite-only">{t("common.inviteOnly")}</option>
            <option value="public">{t("common.public")}</option>
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-2">
          <span className={labelClass}>{t("tripEdit.status")}</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TripStatus)}
            className={inputClass}
          >
            <option value="planning">{t("tripEdit.statusPlanning")}</option>
            <option value="confirmed">{t("tripEdit.statusConfirmed")}</option>
            <option value="completed">{t("tripEdit.statusCompleted")}</option>
            <option value="cancelled">{t("tripEdit.statusCancelled")}</option>
          </select>
        </label>
      </div>

      <div className="border-t-[1.5px] border-ink pt-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">{t("tripEdit.theRoute")}</h2>
        {legs.length > 0 && (
          <ul className="mb-3 flex flex-col gap-2">
            {legs.map((leg, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-2 border-[1.5px] border-ink p-4 text-sm"
              >
                <div>
                  <strong>{leg.place}</strong>
                  {(leg.startDate || leg.endDate) && (
                    <span className="ml-2 text-muted">
                      {leg.startDate} → {leg.endDate}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeLeg(i)}
                  className="mono-label shrink-0 text-[0.6rem] text-muted underline underline-offset-2"
                >
                  {t("common.remove")}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col gap-2 border-[1.5px] border-ink p-4">
          <input
            type="text"
            value={legPlaceDraft}
            onChange={(e) => setLegPlaceDraft(e.target.value)}
            placeholder={t("tripEdit.legPlacePlaceholder")}
            className={inputClass}
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={legStartDraft}
              onChange={(e) => setLegStartDraft(e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <input
              type="date"
              value={legEndDraft}
              onChange={(e) => setLegEndDraft(e.target.value)}
              className={`${inputClass} flex-1`}
            />
          </div>
          <button
            type="button"
            onClick={addLeg}
            className="mono-label self-start border-[1.5px] border-ink px-4 py-2 text-[0.65rem]"
          >
            {t("tripEdit.addLeg")}
          </button>
        </div>
      </div>

      <div className="border-t-[1.5px] border-ink pt-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">{t("tripEdit.details")}</h2>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <label className="flex flex-1 flex-col gap-2">
              <span className={labelClass}>{t("tripEdit.goingWith")}</span>
              <input
                type="text"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-1 flex-col gap-2">
              <span className={labelClass}>{t("tripEdit.mainEvent")}</span>
              <input
                type="text"
                value={mainEvent}
                onChange={(e) => setMainEvent(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>{t("tripEdit.readyMeter")}</span>
            <input
              type="number"
              min={0}
              max={100}
              value={readinessPercent}
              onChange={(e) => setReadinessPercent(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="border-t-[1.5px] border-ink pt-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">{t("tripEdit.beforeWeGo")}</h2>
        {checklist.length > 0 && (
          <ul className="mb-3 flex flex-col gap-2">
            {checklist.map((c, i) => (
              <li
                key={i}
                className="flex items-center justify-between border-[1.5px] border-ink px-4 py-2 text-sm"
              >
                {c.label}
                <button
                  type="button"
                  onClick={() => removeChecklistItem(i)}
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
            value={checklistDraft}
            onChange={(e) => setChecklistDraft(e.target.value)}
            placeholder={t("tripEdit.checklistPlaceholder")}
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            onClick={addChecklistItem}
            className="mono-label border-[1.5px] border-ink px-4 text-[0.65rem]"
          >
            {t("common.add")}
          </button>
        </div>
      </div>

      <div className="border-t-[1.5px] border-ink pt-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">{t("tripEdit.noteSection")}</h2>
        <div className="flex gap-4">
          <label className="flex flex-1 flex-col gap-2">
            <span className={labelClass}>{t("tripEdit.note")}</span>
            <input
              type="text"
              value={noteQuote}
              onChange={(e) => setNoteQuote(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-1 flex-col gap-2">
            <span className={labelClass}>{t("tripEdit.attributedTo")}</span>
            <input
              type="text"
              value={noteAuthor}
              onChange={(e) => setNoteAuthor(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-orange">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="mono-label border-[1.5px] border-ink bg-acid px-6 py-3 text-[0.75rem] text-ink transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
        >
          {isPending ? t("tripEdit.saving") : t("tripEdit.saveChanges")}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/trip/${item.slug}`)}
          className="mono-label border-[1.5px] border-ink px-6 py-3 text-[0.75rem]"
        >
          {t("tripEdit.cancel")}
        </button>
      </div>
    </form>
  );
}
