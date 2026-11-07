"use client";

import { useActionState } from "react";
import { saveClient } from "@/server/actions";
import { useT } from "@/components/i18n";
import { Field } from "@/components/ui";
import { FormError, SubmitButton } from "@/components/form";

type Initial = {
  id: string;
  name: string;
  phone: string | null;
  altPhone: string | null;
  address: string | null;
  notes: string | null;
};

export function ClientForm({ initial }: { initial?: Initial }) {
  const { t } = useT();
  const [state, action] = useActionState(saveClient, undefined);
  return (
    <form action={action} className="space-y-7">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <Field label={t.name}>
        <input name="name" defaultValue={initial?.name} className="line-input" required />
      </Field>
      <Field label={t.phone}>
        <input name="phone" type="tel" inputMode="tel" defaultValue={initial?.phone ?? ""} className="line-input figure" />
      </Field>
      <Field label={t.altPhone}>
        <input
          name="altPhone"
          type="tel"
          inputMode="tel"
          defaultValue={initial?.altPhone ?? ""}
          className="line-input figure"
        />
      </Field>
      <Field label={t.address}>
        <input name="address" defaultValue={initial?.address ?? ""} className="line-input" />
      </Field>
      <Field label={t.notes}>
        <textarea name="notes" rows={2} defaultValue={initial?.notes ?? ""} className="line-input resize-none" />
      </Field>
      <FormError state={state} />
      <SubmitButton />
    </form>
  );
}
