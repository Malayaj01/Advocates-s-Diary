"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Search } from "lucide-react";
import type { ActionState } from "@/server/actions";
import { buttonStyles } from "./ui";
import { useT } from "./i18n";

export function SubmitButton({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  const { t } = useT();
  return (
    <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full ${className}`}>
      {pending ? "…" : (children ?? t.save)}
    </button>
  );
}

export function FormError({ state }: { state: ActionState }) {
  const { t } = useT();
  if (!state?.error) return null;
  return (
    <p role="alert" className="rounded-md border-2 border-red px-4 py-3 font-bold text-red">
      {t[state.error]}
    </p>
  );
}

/** A row of big tappable choices backed by a plain radio input. */
export function Chips<T extends string>({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: { value: T; label: string }[];
  defaultValue?: T;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={o.value}
            defaultChecked={o.value === defaultValue}
            className="peer sr-only"
          />
          <span className="inline-block rounded-md border-2 border-rule px-4 py-2 text-[17px] font-medium peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2">
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

/** Big rupee input with one-tap common amounts. */
export function AmountInput({ name = "amount", defaultValue }: { name?: string; defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue ? String(defaultValue) : "");
  return (
    <div>
      <div className="flex items-baseline gap-1 border-b-2 border-rule focus-within:border-ink">
        <span className="figure text-[32px] font-bold text-ink-soft">₹</span>
        <input
          name={name}
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
          className="figure w-full bg-transparent py-2 text-[40px] font-extrabold outline-none"
          placeholder="0"
          aria-label="amount"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setValue(String(a))}
            className="figure rounded-md border-2 border-rule px-3 py-1.5 text-[17px] font-bold active:bg-paper-deep"
          >
            {a.toLocaleString("en-IN")}
          </button>
        ))}
      </div>
    </div>
  );
}

function shift(key: string, days: number, months = 0) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + months, d + days)).toISOString().slice(0, 10);
}

/** Date field with shortcuts: next dates are usually weeks away. */
export function DateInput({
  name,
  defaultValue,
  base,
  shortcuts = false,
}: {
  name: string;
  defaultValue?: string;
  base: string; // today's key from the server (India time)
  shortcuts?: boolean;
}) {
  const { t } = useT();
  const [value, setValue] = useState(defaultValue ?? "");
  const opts = [
    { label: t.in1Week, v: shift(base, 7) },
    { label: t.in2Weeks, v: shift(base, 14) },
    { label: t.in1Month, v: shift(base, 0, 1) },
  ];
  return (
    <div>
      <input
        type="date"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="line-input figure"
      />
      {shortcuts && (
        <div className="mt-3 flex flex-wrap gap-2">
          {opts.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setValue(o.v)}
              className={`rounded-md border-2 px-3 py-1.5 text-[17px] font-medium ${
                value === o.v ? "border-ink bg-ink text-paper" : "border-rule"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Live search that keeps the query in the URL (?q=). */
export function SearchBox({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get("q") ?? "") === q) return;
      const next = new URLSearchParams(params);
      if (q) next.set("q", q);
      else next.delete("q");
      next.delete("saved");
      router.replace(`${path}?${next}`, { scroll: false });
    }, 250);
    return () => clearTimeout(id);
  }, [q, params, path, router]);

  return (
    <div className="flex items-center gap-2 border-b-2 border-ink pb-1">
      <Search size={22} className="text-ink-soft" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent py-2 text-[20px] outline-none placeholder:text-ink-faint"
      />
    </div>
  );
}

/** Shows a stamped "Saved" mark after a successful save, then clears ?saved. */
export function SavedToast() {
  const { t } = useT();
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const show = params.get("saved") === "1";

  useEffect(() => {
    if (!show) return;
    const id = setTimeout(() => {
      const next = new URLSearchParams(params);
      next.delete("saved");
      const qs = next.toString();
      router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
    }, 2200);
    return () => clearTimeout(id);
  }, [show, params, path, router]);

  if (!show) return null;
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 top-6 z-30 flex justify-center">
      <span className="flex -rotate-2 items-center gap-2 rounded-md border-[3px] border-green bg-paper px-5 py-2 text-[20px] font-extrabold text-green shadow-lg">
        <Check size={24} strokeWidth={3} /> {t.saved}
      </span>
    </div>
  );
}

/** A delete button that asks once before submitting its form. */
export function ConfirmButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { t } = useT();
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className={className}>
        {children}
      </button>
    );
  }
  return (
    <span className="flex items-center gap-3">
      <span className="text-[15px] text-red">{t.confirmDelete}</span>
      <button type="submit" className="font-bold text-red underline">
        {t.delete}
      </button>
      <button type="button" onClick={() => setArmed(false)} className="text-ink-soft">
        {t.cancel}
      </button>
    </span>
  );
}
