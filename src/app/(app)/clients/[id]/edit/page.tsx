import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getT } from "@/i18n/server";
import { PageHeader } from "@/components/ui";
import { ClientForm } from "../../client-form";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ t }, client] = await Promise.all([getT(), db.client.findUnique({ where: { id } })]);
  if (!client) notFound();
  return (
    <>
      <PageHeader title={t.edit} back={`/clients/${id}`} />
      <ClientForm initial={client} />
    </>
  );
}
