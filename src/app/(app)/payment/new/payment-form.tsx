"use client";

import { useActionState } from "react";
import { addPayment } from "@/server/actions";
import { useT } from "@/components/i18n";
import { Field } from "@/components/ui";
import { AmountInput, Chips, DateInput, FormError, SubmitButton } from "@/components/form";

/** Three fields: amount, how, when. Date defaults to today. */
export function PaymentForm({ caseId, todayKey }: { caseId: string; todayKey: string }) {
  const { t } = useT();
  const [state, action] = useActionState(addPayment, undefined);
  const modes = (Object.keys(t.modes) as (keyof typeof t.modes)[]).map((k) => ({ value: k, label: t.modes[k] }));

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="caseId" value={caseId} />
      <AmountInput />
      <Field label={t.mode}>
        <Chips name="mode" options={modes} defaultValue="CASH" />
      </Field>
      <Field label={t.paidOn}>
        <DateInput name="paidOn" base={todayKey} defaultValue={todayKey} />
      </Field>
      <Field label={t.notes}>
        <input name="note" className="line-input" />
      </Field>
      <FormError state={state} />
      <SubmitButton />
    </form>
  );
}
