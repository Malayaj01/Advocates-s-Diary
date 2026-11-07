import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { clientOptions } from "@/server/queries";
import { getT } from "@/i18n/server";
import { todayKey } from "@/lib/dates";
import { PageHeader } from "@/components/ui";
import { CaseForm } from "../../case-form";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ t }, c, clients] = await Promise.all([getT(), db.case.findUnique({ where: { id } }), clientOptions()]);
  if (!c) notFound();
  return (
    <>
      <PageHeader title={t.edit} back={`/cases/${id}`} />
      <CaseForm clients={clients} todayKey={todayKey()} initial={c} />
    </>
  );
}
