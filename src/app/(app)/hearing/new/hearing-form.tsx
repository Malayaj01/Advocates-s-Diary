"use client";

import { useActionState } from "react";
import { addHearing } from "@/server/actions";
import { useT } from "@/components/i18n";
import { Field } from "@/components/ui";
import { DateInput, FormError, SubmitButton, SuggestInput } from "@/components/form";

export function HearingForm({ caseId, todayKey }: { caseId: string; todayKey: string }) {
  const { t } = useT();
  const [state, action] = useActionState(addHearing, undefined);
  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="caseId" value={caseId} />
      <Field label={t.date}>
        <DateInput name="date" base={todayKey} shortcuts />
      </Field>
      <Field label={t.purpose}>
        <SuggestInput name="purpose" suggestions={t.purposeSuggestions} />
      </Field>
      <FormError state={state} />
      <SubmitButton />
    </form>
  );
}
