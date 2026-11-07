import { SearchX } from "lucide-react";
import { getT } from "@/i18n/server";
import { LinkButton } from "@/components/ui";

/** Shown for a case, client or hearing that no longer exists. */
export default async function NotFound() {
  const { t } = await getT();
  return (
    <div className="card mt-10 p-6 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-paper-deep text-ink-soft">
        <SearchX size={28} />
      </span>
      <p className="mt-4 text-[20px] font-bold">{t.notFound}</p>
      <LinkButton href="/" variant="primary" className="mt-6 w-full">
        {t.goHome}
      </LinkButton>
    </div>
  );
}
