import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { listClients } from "@/server/queries";
import { getT } from "@/i18n/server";
import { SearchBox } from "@/components/form";
import { Empty, Money, PageHeader } from "@/components/ui";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { t } = await getT();
  const clients = await listClients(q);

  return (
    <>
      <PageHeader
        title={t.clients}
        action={
          <Link
            href="/clients/new"
            className="grid h-12 w-12 place-items-center rounded-md bg-ink text-paper"
            aria-label={t.addClient}
          >
            <Plus size={26} strokeWidth={2.5} />
          </Link>
        }
      />
      <Suspense>
        <SearchBox placeholder={t.searchClients} />
      </Suspense>

      {clients.length ? (
        <ul className="card-list mt-4">
          {clients.map((c) => (
            <li key={c.id}>
              <Link href={`/clients/${c.id}`} className="flex items-center gap-3 py-3.5 active:bg-paper-deep">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[19px] font-bold">{c.name}</p>
                  <p className="figure truncate text-[15px] text-ink-soft">
                    {[c.phone, `${c.caseCount} ${t.cases}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {c.due > 0 && <Money amount={c.due} owed className="text-[18px]" />}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>{t.noResults}</Empty>
      )}
    </>
  );
}
