"use client";

import { useActionState, useState } from "react";
import { UserPlus } from "lucide-react";
import { addJunior } from "@/server/actions";
import { useT } from "@/components/i18n";
import { Field } from "@/components/ui";
import { FormError, SubmitButton } from "@/components/form";

export function AddJuniorForm() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(addJunior, undefined);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-4 flex items-center gap-2 font-bold text-ink">
        <UserPlus size={20} /> {t.addJunior}
      </button>
    );
  }

  return (
    <form action={action} className="mt-5 space-y-6 border-l-4 border-rule pl-4">
      <Field label={t.name}>
        <input name="name" className="line-input" required autoFocus />
      </Field>
      <Field label={t.username}>
        <input name="username" autoCapitalize="none" className="line-input" required />
      </Field>
      <Field label={t.password}>
        <input name="password" type="password" minLength={6} autoComplete="new-password" className="line-input" required />
      </Field>
      <FormError state={state} />
      <SubmitButton>{t.addJunior}</SubmitButton>
    </form>
  );
}
