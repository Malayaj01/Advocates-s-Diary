import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { listCases, type CaseFilter } from "@/server/queries";
import { getT } from "@/i18n/server";
import { CaseRow } from "@/components/case-row";
import { SearchBox } from "@/components/form";
import { Empty, PageHeader } from "@/components/ui";

const FILTERS: CaseFilter[] = ["active", "due", "disposed", "all"];

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q = "", filter: f } = await searchParams;
  const filter: CaseFilter = FILTERS.includes(f as CaseFilter) ? (f as CaseFilter) : "active";
  const { t, lang } = await getT();
  const cases = await listCases({ q, filter });

  const label: Record<CaseFilter, string> = { active: t.active, due: t.feeDue, disposed: t.disposed, all: t.all };

  return (
    <>
      <PageHeader
        title={t.cases}
        action={
          <Link href="/cases/new" className="grid h-12 w-12 place-items-center rounded-md bg-ink text-paper" aria-label={t.addCase}>
            <Plus size={26} strokeWidth={2.5} />
          </Link>
        }
      />
      <Suspense>
        <SearchBox placeholder={t.searchCases} />
      </Suspense>

      <nav className="mt-4 flex gap-5 overflow-x-auto pb-1">
        {FILTERS.map((key) => {
          const params = new URLSearchParams({ ...(q ? { q } : {}), filter: key });
          return (
            <Link
              key={key}
              href={`/cases?${params}`}
              className={`shrink-0 border-b-[3px] pb-1 text-[17px] ${
                filter === key ? "border-red font-bold text-ink" : "border-transparent text-ink-soft"
              }`}
            >
              {label[key]}
            </Link>
          );
        })}
        <span className="figure ml-auto shrink-0 text-[17px] font-bold text-ink-soft">{cases.length}</span>
      </nav>

      {cases.length ? (
        <ul className="ruled mt-3">
          {cases.map((c) => (
            <CaseRow key={c.id} c={c} t={t} lang={lang} />
          ))}
        </ul>
      ) : (
        <Empty>{t.noResults}</Empty>
      )}
    </>
  );
}
