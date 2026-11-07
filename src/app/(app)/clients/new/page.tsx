import { getT } from "@/i18n/server";
import { PageHeader } from "@/components/ui";
import { ClientForm } from "../client-form";

export default async function NewClientPage() {
  const { t } = await getT();
  return (
    <>
      <PageHeader title={t.addClient} back="/clients" />
      <ClientForm />
    </>
  );
}
