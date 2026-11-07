"use client";

import { useActionState } from "react";
import { login } from "@/server/actions";
import { useT } from "@/components/i18n";
import { Field } from "@/components/ui";
import { FormError, SubmitButton } from "@/components/form";
import { LanguageSwitch } from "@/components/language-switch";

export function LoginForm() {
  const { t } = useT();
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-7">
      <div className="flex items-start justify-between">
        <h1 className="figure text-[34px] font-extrabold leading-tight">{t.appName}</h1>
        <LanguageSwitch />
      </div>
      <Field label={t.username}>
        <input name="username" autoCapitalize="none" autoComplete="username" className="line-input" required />
      </Field>
      <Field label={t.password}>
        <input name="password" type="password" autoComplete="current-password" className="line-input" required />
      </Field>
      <FormError state={state} />
      <SubmitButton>{t.login}</SubmitButton>
    </form>
  );
}
