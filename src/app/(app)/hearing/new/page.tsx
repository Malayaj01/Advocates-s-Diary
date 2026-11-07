import { notFound } from "next/navigation";
import { todayKey } from "@/lib/dates";
import { getCase } from "@/server/queries";
import { getT } from "@/i18n/server";
import { CasePicker } from "@/components/case-picker";
import { PageHeader } from "@/components/ui";
import { HearingForm } from "./hearing-form";

export default async function NewHearingPage({ searchParams }: { searchParams: Promise<{ case?: string; q?: string }> }) {
  const { case: caseId, q = "" } = await searchParams;
  const { t } = await getT();

  if (!caseId) {
    return (
      <>
        <PageHeader title={t.whichCase} back="/" />
        <CasePicker q={q} hrefFor={(id) => `/hearing/new?case=${id}`} />
      </>
    );
  }

  const c = await getCase(caseId);
  if (!c) notFound();
  return (
    <>
      <PageHeader title={t.addHearing} back={`/cases/${c.id}`} />
      <p className="-mt-2 mb-7 truncate border-b border-rule pb-3 text-[18px] font-bold">{c.title}</p>
      <HearingForm caseId={c.id} todayKey={todayKey()} />
    </>
  );
}
