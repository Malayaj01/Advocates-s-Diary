import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { getClient } from "@/server/queries";
import { getT } from "@/i18n/server";
import { CaseRow } from "@/components/case-row";
import { ContactButtons } from "@/components/contact-buttons";
import { Empty, LinkButton, Money, PageHeader, SectionTitle } from "@/components/ui";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ t, lang }, data] = await Promise.all([getT(), getClient(id)]);
  if (!data) notFound();
  const { client, cases, totalDue } = data;
  const contact = [client.phone, client.address].filter(Boolean).join(" · ");

  return (
    <>
      <PageHeader
        title={client.name}
        back="/clients"
        action={
          <Link href={`/clients/${client.id}/edit`} className="grid h-11 w-11 place-items-center" aria-label={t.edit}>
            <Pencil size={22} />
          </Link>
        }
      />
      <div className="-mt-3 space-y-3">
        {contact && <p className="figure text-[17px] text-ink-soft">{contact}</p>}
        <ContactButtons phone={client.phone} t={t} />
      </div>

      <div className="card mt-5 flex items-baseline justify-between p-4">
        <span className="text-[14px] font-bold uppercase tracking-wider text-ink-soft">{t.totalDue}</span>
        <Money amount={totalDue} owed={totalDue > 0} className="text-[26px]" />
      </div>

      <SectionTitle>{t.cases}</SectionTitle>
      {cases.length ? (
        <ul className="card-list">
          {cases.map((c) => (
            <CaseRow key={c.id} c={c} t={t} lang={lang} />
          ))}
        </ul>
      ) : (
        <Empty>-</Empty>
      )}

      <LinkButton href={`/cases/new?client=${client.id}`} className="mt-6 w-full">
        <Plus size={20} strokeWidth={3} /> {t.addCase}
      </LinkButton>

      {client.notes && (
        <>
          <SectionTitle>{t.notes}</SectionTitle>
          <p className="whitespace-pre-wrap text-[17px]">{client.notes}</p>
        </>
      )}
    </>
  );
}
