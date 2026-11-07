"use client";

import { useActionState } from "react";
import { completeHearing } from "@/server/actions";
import { useT } from "@/components/i18n";
import { Field } from "@/components/ui";
import { DateInput, FormError, SubmitButton, SuggestInput } from "@/components/form";

export function CompleteForm({ hearingId, todayKey }: { hearingId: string; todayKey: string }) {
  const { t } = useT();
  const [state, action] = useActionState(completeHearing, undefined);
  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="hearingId" value={hearingId} />
      <Field label={t.outcome}>
        <SuggestInput name="outcome" suggestions={t.outcomeSuggestions} />
      </Field>
      <Field label={t.nextDate}>
        <DateInput name="nextDate" base={todayKey} shortcuts />
      </Field>
      <Field label={t.purpose}>
        <SuggestInput name="purpose" suggestions={t.purposeSuggestions} />
      </Field>
      <FormError state={state} />
      <SubmitButton />
    </form>
  );
}
