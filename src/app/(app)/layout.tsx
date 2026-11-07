import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { I18nProvider } from "@/components/i18n";
import { BottomNav } from "@/components/bottom-nav";
import { SavedToast } from "@/components/form";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const { t, lang } = await getT();
  return (
    <I18nProvider t={t} lang={lang}>
      <main className="page mx-auto max-w-xl">{children}</main>
      <BottomNav />
      <Suspense>
        <SavedToast />
      </Suspense>
    </I18nProvider>
  );
}
