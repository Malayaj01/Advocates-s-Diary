import { clientOptions } from "@/server/queries";
import { getT } from "@/i18n/server";
import { todayKey } from "@/lib/dates";
import { PageHeader } from "@/components/ui";
import { CaseForm } from "../case-form";

export default async function NewCasePage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const { client } = await searchParams;
  const { t } = await getT();
  const clients = await clientOptions();
  return (
    <>
      <PageHeader title={t.addCase} back={client ? `/clients/${client}` : "/cases"} />
      <CaseForm clients={clients} todayKey={todayKey()} presetClientId={client} />
    </>
  );
}
