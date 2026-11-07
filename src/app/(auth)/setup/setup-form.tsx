"use client";

import { useActionState } from "react";
import { setupAdmin } from "@/server/actions";
import { useT } from "@/components/i18n";
import { Field } from "@/components/ui";
import { FormError, SubmitButton } from "@/components/form";
import { LanguageSwitch } from "@/components/language-switch";

export function SetupForm() {
  const { t } = useT();
  const [state, action] = useActionState(setupAdmin, undefined);
  return (
    <form action={action} className="space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="figure text-[34px] font-extrabold leading-tight">{t.appName}</h1>
          <p className="mt-1 text-ink-soft">{t.setupTitle}</p>
        </div>
        <LanguageSwitch />
      </div>
      <Field label={t.name}>
        <input name="name" className="line-input" required />
      </Field>
      <Field label={t.username}>
        <input name="username" autoCapitalize="none" className="line-input" required />
      </Field>
      <Field label={t.password}>
        <input name="password" type="password" minLength={6} autoComplete="new-password" className="line-input" required />
      </Field>
      <FormError state={state} />
      <SubmitButton />
    </form>
  );
}
