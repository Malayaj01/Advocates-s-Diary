"use client";

import { useActionState, useState } from "react";
import { ChevronDown } from "lucide-react";
import { saveCase } from "@/server/actions";
import { useT } from "@/components/i18n";
import { Field } from "@/components/ui";
import { Chips, DateInput, FormError, SubmitButton } from "@/components/form";

type ClientOption = { id: string; name: string; phone: string | null };

export type CaseInitial = {
  id: string;
  title: string;
  clientId: string;
  caseNumber: string | null;
  cnr: string | null;
  court: string | null;
  caseType: string;
  side: string | null;
  opposingParty: string | null;
  status: string;
  feeAgreed: number;
  notes: string | null;
};

const NEW = "__new__";

/**
 * Only four things up front: title, client, court, fee (+ first date for a new case).
 * Everything else sits behind "More details".
 */
export function CaseForm({
  clients,
  initial,
  todayKey,
  presetClientId,
}: {
  clients: ClientOption[];
  initial?: CaseInitial;
  todayKey: string;
  presetClientId?: string;
}) {
  const { t } = useT();
  const [state, action] = useActionState(saveCase, undefined);
  const [clientChoice, setClientChoice] = useState(
    initial?.clientId ?? presetClientId ?? (clients.length ? "" : NEW),
  );

  const typeOptions = (Object.keys(t.types) as (keyof typeof t.types)[]).map((k) => ({ value: k, label: t.types[k] }));
  const statusOptions = (Object.keys(t.statuses) as (keyof typeof t.statuses)[]).map((k) => ({
    value: k,
    label: t.statuses[k],
  }));

  return (
    <form action={action} className="space-y-7">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="clientId" value={clientChoice === NEW ? "" : clientChoice} />

      <Field label={t.caseTitle}>
        <input name="title" defaultValue={initial?.title} placeholder={t.caseTitleHint} className="line-input" required />
      </Field>

      <Field label={t.client}>
        <select
          value={clientChoice}
          onChange={(e) => setClientChoice(e.target.value)}
          className="line-input appearance-none"
          required
        >
          <option value="" disabled>
            {t.chooseClient}
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.phone ? ` · ${c.phone}` : ""}
            </option>
          ))}
          <option value={NEW}>+ {t.newClientInline}</option>
        </select>
      </Field>

      {clientChoice === NEW && (
        <div className="space-y-5 border-l-4 border-rule pl-4">
          <Field label={t.name}>
            <input name="newClientName" className="line-input" required autoFocus />
          </Field>
          <Field label={t.phone}>
            <input name="newClientPhone" type="tel" inputMode="tel" className="line-input figure" />
          </Field>
        </div>
      )}

      <Field label={t.court}>
        <input name="court" defaultValue={initial?.court ?? ""} className="line-input" />
      </Field>

      <Field label={t.feeAgreed}>
        <div className="flex items-baseline gap-1 border-b-2 border-rule focus-within:border-ink">
          <span className="figure text-[24px] font-bold text-ink-soft">₹</span>
          <input
            name="feeAgreed"
            inputMode="numeric"
            defaultValue={initial?.feeAgreed || ""}
            placeholder="0"
            className="figure w-full bg-transparent py-2 text-[26px] font-bold outline-none"
          />
        </div>
      </Field>

      {!initial && (
        <Field label={t.nextDate}>
          <DateInput name="firstDate" base={todayKey} shortcuts />
        </Field>
      )}

      <details className="group" open={Boolean(initial)}>
        <summary className="flex cursor-pointer list-none items-center gap-2 text-[17px] font-bold text-ink-soft">
          <ChevronDown size={20} className="transition group-open:rotate-180" />
          {t.more}
        </summary>
        <div className="mt-5 space-y-7">
          <Field label={t.caseNumber}>
            <input name="caseNumber" defaultValue={initial?.caseNumber ?? ""} className="line-input figure" />
          </Field>
          <Field label={t.caseType}>
            <Chips name="caseType" options={typeOptions} defaultValue={(initial?.caseType ?? "CIVIL") as keyof typeof t.types} />
          </Field>
          <Field label={t.side}>
            <Chips
              name="side"
              options={[
                { value: "PETITIONER", label: t.petitioner },
                { value: "RESPONDENT", label: t.respondent },
              ]}
              defaultValue={(initial?.side ?? undefined) as "PETITIONER" | "RESPONDENT" | undefined}
            />
          </Field>
          <Field label={t.opposingParty}>
            <input name="opposingParty" defaultValue={initial?.opposingParty ?? ""} className="line-input" />
          </Field>
          <Field label={t.cnr}>
            <input name="cnr" defaultValue={initial?.cnr ?? ""} className="line-input figure" autoCapitalize="characters" />
          </Field>
          {initial && (
            <Field label={t.status}>
              <Chips name="status" options={statusOptions} defaultValue={initial.status as keyof typeof t.statuses} />
            </Field>
          )}
          <Field label={t.notes}>
            <textarea name="notes" defaultValue={initial?.notes ?? ""} rows={3} className="line-input resize-none" />
          </Field>
        </div>
      </details>

      <FormError state={state} />
      <SubmitButton />
    </form>
  );
}
