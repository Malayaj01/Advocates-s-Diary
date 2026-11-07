import { Suspense } from "react";
import { pickCases } from "@/server/queries";
import { getT } from "@/i18n/server";
import { CaseRow } from "./case-row";
import { SearchBox } from "./form";
import { Empty } from "./ui";

/** "Which case?" — search the active cases and tap one to continue. */
export async function CasePicker({ q, hrefFor }: { q: string; hrefFor: (caseId: string) => string }) {
  const { t, lang } = await getT();
  const cases = await pickCases(q);
  return (
    <>
      <Suspense>
        <SearchBox placeholder={t.searchCases} />
      </Suspense>
      {cases.length ? (
        <ul className="ruled mt-4">
          {cases.map((c) => (
            <CaseRow key={c.id} c={c} t={t} lang={lang} href={hrefFor(c.id)} />
          ))}
        </ul>
      ) : (
        <Empty>{t.noResults}</Empty>
      )}
    </>
  );
}
