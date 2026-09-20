"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { getCurrentMember } from "@/lib/current-member";

// Same survey for every Trip in v1, per the requirements doc — exact
// wording is a reasonable default, not finalized.
export interface SurveyAnswers {
  inOrOut: "in" | "maybe" | "out";
  conflicts: string;
  needs: string;
}

export async function getMySurveyResponse(tripId: string): Promise<SurveyAnswers | null> {
  const member = await getCurrentMember();
  if (!member || !isSupabaseAdminConfigured || !supabaseAdmin) return null;

  const { data } = await supabaseAdmin
    .from("survey_responses")
    .select("in_or_out, conflicts, needs")
    .eq("trip_id", tripId)
    .eq("member_id", member.id)
    .maybeSingle();

  if (!data) return null;
  return { inOrOut: data.in_or_out, conflicts: data.conflicts, needs: data.needs };
}

export type SubmitSurveyResult = { ok: true } | { ok: false; error: string };

export async function submitSurvey(
  tripId: string,
  slug: string,
  answers: SurveyAnswers
): Promise<SubmitSurveyResult> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, error: "Sign in to answer the survey." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "The survey isn't wired up on this environment yet." };
  }

  const { error } = await supabaseAdmin.from("survey_responses").upsert(
    {
      trip_id: tripId,
      member_id: member.id,
      in_or_out: answers.inOrOut,
      conflicts: answers.conflicts.trim(),
      needs: answers.needs.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "trip_id,member_id" }
  );

  if (error) {
    console.error("submitSurvey failed", error);
    return { ok: false, error: "Couldn't save that. Try again." };
  }

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}
