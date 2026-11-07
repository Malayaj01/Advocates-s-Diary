import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { rupees } from "@/lib/money";

// Small presentational pieces shared by every screen.

export function PageHeader({
  title,
  back,
  action,
}: {
  title: React.ReactNode;
  back?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex items-center gap-2">
      {back && (
        <Link href={back} className="-ml-3 grid h-11 w-11 place-items-center text-ink" aria-label="Back">
          <ChevronLeft size={28} />
        </Link>
      )}
      <h1 className="figure min-w-0 flex-1 truncate text-[26px] font-extrabold leading-tight">{title}</h1>
      {action}
    </header>
  );
}

/** Rupee amount in ledger style. Red when it is money owed. */
export function Money({ amount, owed, className = "" }: { amount: number; owed?: boolean; className?: string }) {
  return <span className={`figure font-bold ${owed ? "text-red" : ""} ${className}`}>{rupees(amount)}</span>;
}

export function Stamp({ children, tone = "ink" }: { children: React.ReactNode; tone?: "ink" | "red" | "green" }) {
  const color = tone === "red" ? "text-red" : tone === "green" ? "text-green" : "text-ink-soft";
  return <span className={`stamp ${color}`}>{children}</span>;
}

/** Calendar-page style date: big day number with the month under it. */
export function DateStamp({ day, month, muted }: { day: number; month: string; muted?: boolean }) {
  return (
    <div
      className={`grid w-14 shrink-0 place-items-center rounded-sm border-2 py-1 leading-none ${
        muted ? "border-rule text-ink-soft" : "border-ink text-ink"
      }`}
    >
      <span className="figure text-[24px] font-extrabold">{day}</span>
      <span className="mt-1 text-[12px] font-bold uppercase tracking-wider">{month}</span>
    </div>
  );
}

const buttonBase =
  "inline-flex h-14 items-center justify-center gap-2 rounded-md px-5 text-[19px] font-bold transition active:translate-y-px disabled:opacity-50";

export const buttonStyles = {
  primary: `${buttonBase} bg-ink text-paper shadow-[0_3px_0_0_#0e1730]`,
  outline: `${buttonBase} border-2 border-ink text-ink bg-paper shadow-[0_3px_0_0_var(--color-ink)]`,
  ghost: `${buttonBase} text-ink-soft`,
  danger: `${buttonBase} border-2 border-red text-red`,
};

export function LinkButton({
  href,
  variant = "outline",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof buttonStyles;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${buttonStyles[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-[15px] font-bold uppercase tracking-wide text-ink-soft">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[14px] text-ink-faint">{hint}</span>}
    </label>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-1 mt-8 flex items-baseline justify-between">
      <h2 className="text-[15px] font-bold uppercase tracking-wider text-ink-soft">{children}</h2>
      {right}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-[18px] text-ink-faint">{children}</p>;
}
