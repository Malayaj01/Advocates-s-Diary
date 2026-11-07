import { notFound } from "next/navigation";
import { todayKey } from "@/lib/dates";
import { getCase } from "@/server/queries";
import { getT } from "@/i18n/server";
import { CasePicker } from "@/components/case-picker";
import { Money, PageHeader } from "@/components/ui";
import { PaymentForm } from "./payment-form";

export default async function NewPaymentPage({ searchParams }: { searchParams: Promise<{ case?: string; q?: string }> }) {
  const { case: caseId, q = "" } = await searchParams;
  const { t } = await getT();

  // Step 1: pick the case.
  if (!caseId) {
    return (
      <>
        <PageHeader title={t.whichCase} back="/" />
        <CasePicker q={q} hrefFor={(id) => `/payment/new?case=${id}`} />
      </>
    );
  }

  // Step 2: amount, mode, date.
  const c = await getCase(caseId);
  if (!c) notFound();
  return (
    <>
      <PageHeader title={t.addPayment} back={`/cases/${c.id}`} />
      <div className="-mt-2 mb-7 flex items-baseline justify-between gap-3 border-b border-rule pb-3">
        <p className="min-w-0 truncate text-[18px] font-bold">{c.title}</p>
        {c.due > 0 && (
          <p className="shrink-0 text-[15px] text-ink-soft">
            {t.due} <Money amount={c.due} owed className="text-[18px]" />
          </p>
        )}
      </div>
      <PaymentForm caseId={c.id} todayKey={todayKey()} />
    </>
  );
}
