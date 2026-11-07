import { getT } from "@/i18n/server";
import { I18nProvider } from "@/components/i18n";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t, lang } = await getT();
  return (
    <I18nProvider t={t} lang={lang}>
      <main className="page mx-auto flex max-w-md flex-col justify-center">{children}</main>
    </I18nProvider>
  );
}
