"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTrip, createManifest } from "@/app/actions/items";
import { TripStatus, Visibility, ChecklistItem, SignalItem } from "@/lib/types";

type Kind = "trip" | "manifest";
type Leg = { place: string; startDate: string; endDate: string };

const inputClass =
  "border-[1.5px] border-ink bg-paper px-4 py-3 text-base outline-none focus:shadow-[4px_4px_0_var(--ink)]";
const labelClass = "mono-label text-[0.7rem] text-muted";

export function NewItemForm() {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("trip");

  const [title, setTitle] = useState("");
  const [roughDate, setRoughDate] = useState("");
  const [countries, setCountries] = useState(""); // comma-separated
  const [summary, setSummary] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("invite-only");
  const [status, setStatus] = useState<TripStatus>("planning");
  const [legs, setLegs] = useState<Leg[]>([{ place: "", startDate: "", endDate: "" }]);

  // Trip-only detail-page extras.
  const [companionName, setCompanionName] = useState("");
  const [mainEvent, setMainEvent] = useState("");
  const [readinessPercent, setReadinessPercent] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistDraft, setChecklistDraft] = useState("");

  // Manifest-only detail-page extras.
  const [realityFundPercent, setRealityFundPercent] = useState("");
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [signalTitleDraft, setSignalTitleDraft] = useState("");
  const [signalBodyDraft, setSignalBodyDraft] = useState("");

  // Shared "note" card (trip note / manifest note).
  const [noteQuote, setNoteQuote] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addChecklistItem() {
    if (!checklistDraft.trim()) return;
    setChecklist((prev) => [...prev, { label: checklistDraft.trim(), done: false }]);
    setChecklistDraft("");
  }

  function removeChecklistItem(index: number) {
    setChecklist((prev) => prev.filter((_, i) => i !== index));
  }

  function addSignal() {
    if (!signalTitleDraft.trim()) return;
    setSignals((prev) => [
      ...prev,
      { title: signalTitleDraft.trim(), body: signalBodyDraft.trim() },
    ]);
    setSignalTitleDraft("");
    setSignalBodyDraft("");
  }

  function removeSignal(index: number) {
    setSignals((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLeg(index: number, field: keyof Leg, value: string) {
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, [field]: value } : leg)));
  }

  function addLeg() {
    setLegs((prev) => [...prev, { place: "", startDate: "", endDate: "" }]);
  }

  function removeLeg(index: number) {
    setLegs((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const countryList = countries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const result =
        kind === "trip"
          ? await createTrip({
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
            })
          : await createManifest({
              title,
              roughDate,
              countryOptions: countryList,
              summary,
              visibility,
              signals,
              realityFundPercent: realityFundPercent.trim() ? Number(realityFundPercent) : null,
              noteQuote,
              noteAuthor,
            });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/${kind === "trip" ? "trip" : "manifest"}/${result.slug}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex gap-2">
        {(["trip", "manifest"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`mono-label flex-1 border-[1.5px] border-ink px-4 py-3 text-[0.75rem] transition-colors ${
              kind === k ? "bg-ink text-paper" : "bg-paper text-ink"
            }`}
          >
            {k === "trip" ? "Trip" : "Manifest"}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Title</span>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === "trip" ? "Osaka in the fall" : "Somewhere warm in Feb?"}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Rough date</span>
        <input
          type="text"
          value={roughDate}
          onChange={(e) => setRoughDate(e.target.value)}
          placeholder="Late Nov – early Dec"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>
          {kind === "trip" ? "Countries" : "Country options people can vote on"}
        </span>
        <input
          type="text"
          value={countries}
          onChange={(e) => setCountries(e.target.value)}
          placeholder="Japan, South Korea"
          className={inputClass}
        />
        <span className="text-xs text-muted">Comma-separated.</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Summary</span>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="What's the idea?"
          className={inputClass}
        />
      </label>

      {kind === "trip" && (
        <div className="flex flex-col gap-3">
          <span className={labelClass}>Calendar</span>
          {legs.map((leg, i) => (
            <div key={i} className="flex flex-col gap-2 border-[1.5px] border-ink p-4">
              <input
                type="text"
                value={leg.place}
                onChange={(e) => updateLeg(i, "place", e.target.value)}
                placeholder="Place"
                className={inputClass}
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={leg.startDate}
                  onChange={(e) => updateLeg(i, "startDate", e.target.value)}
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="date"
                  value={leg.endDate}
                  onChange={(e) => updateLeg(i, "endDate", e.target.value)}
                  className={`${inputClass} flex-1`}
                />
              </div>
              {legs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLeg(i)}
                  className="mono-label self-start text-[0.6rem] text-muted underline underline-offset-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addLeg}
            className="mono-label self-start border-[1.5px] border-ink px-3 py-2 text-[0.65rem]"
          >
            + Add a leg
          </button>
        </div>
      )}

      {kind === "trip" && (
        <>
          <div className="flex gap-4">
            <label className="flex flex-1 flex-col gap-2">
              <span className={labelClass}>Going with</span>
              <input
                type="text"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                placeholder="Mum (optional)"
                className={inputClass}
              />
            </label>
            <label className="flex flex-1 flex-col gap-2">
              <span className={labelClass}>Main event</span>
              <input
                type="text"
                value={mainEvent}
                onChange={(e) => setMainEvent(e.target.value)}
                placeholder="Disneyland 10K (optional)"
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Ready meter (0–100, optional)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={readinessPercent}
              onChange={(e) => setReadinessPercent(e.target.value)}
              placeholder="72"
              className={inputClass}
            />
          </label>

          <div className="flex flex-col gap-3">
            <span className={labelClass}>Before-we-go checklist (optional)</span>
            {checklist.length > 0 && (
              <ul className="flex flex-col gap-2">
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
                      Remove
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
                placeholder="Hotel near MTR"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="mono-label border-[1.5px] border-ink px-4 text-[0.65rem]"
              >
                Add
              </button>
            </div>
          </div>
        </>
      )}

      {kind === "manifest" && (
        <>
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Reality fund (0–100, optional)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={realityFundPercent}
              onChange={(e) => setRealityFundPercent(e.target.value)}
              placeholder="34"
              className={inputClass}
            />
          </label>

          <div className="flex flex-col gap-3">
            <span className={labelClass}>Signs of life (optional)</span>
            {signals.length > 0 && (
              <ul className="flex flex-col gap-2">
                {signals.map((s, i) => (
                  <li key={i} className="border-[1.5px] border-ink p-4 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <strong>{s.title}</strong>
                      <button
                        type="button"
                        onClick={() => removeSignal(i)}
                        className="mono-label shrink-0 text-[0.6rem] text-muted underline underline-offset-2"
                      >
                        Remove
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
                placeholder="The tour exists"
                className={inputClass}
              />
              <input
                type="text"
                value={signalBodyDraft}
                onChange={(e) => setSignalBodyDraft(e.target.value)}
                placeholder="Any 2027 announcement moves this from delusional to possible."
                className={inputClass}
              />
              <button
                type="button"
                onClick={addSignal}
                className="mono-label self-start border-[1.5px] border-ink px-4 py-2 text-[0.65rem]"
              >
                + Add a signal
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-2">
          <span className={labelClass}>{kind === "trip" ? "Trip note (optional)" : "Manifest note (optional)"}</span>
          <input
            type="text"
            value={noteQuote}
            onChange={(e) => setNoteQuote(e.target.value)}
            placeholder="A little quote for the side card"
            className={inputClass}
          />
        </label>
        <label className="flex flex-1 flex-col gap-2">
          <span className={labelClass}>— attributed to</span>
          <input
            type="text"
            value={noteAuthor}
            onChange={(e) => setNoteAuthor(e.target.value)}
            placeholder="Future you"
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-2">
          <span className={labelClass}>Visibility</span>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className={inputClass}
          >
            <option value="invite-only">Invite-only</option>
            <option value="public">Public</option>
          </select>
        </label>
        {kind === "trip" && (
          <label className="flex flex-1 flex-col gap-2">
            <span className={labelClass}>Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TripStatus)}
              className={inputClass}
            >
              <option value="planning">Planning</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </label>
        )}
      </div>

      {error && <p className="text-sm text-orange">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mono-label self-start border-[1.5px] border-ink bg-acid px-6 py-3 text-[0.75rem] text-ink transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
      >
        {isPending ? "Publishing…" : `Publish ${kind === "trip" ? "trip" : "manifest"}`}
      </button>
    </form>
  );
}
