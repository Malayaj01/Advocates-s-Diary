import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listUsers, recentActivity } from "@/server/queries";
import { logout, toggleUser } from "@/server/actions";
import { getT } from "@/i18n/server";
import { fmtDay } from "@/i18n/format";
import { LanguageSwitch } from "@/components/language-switch";
import { PageHeader, SectionTitle, Stamp, buttonStyles } from "@/components/ui";
import { AddJuniorForm } from "./add-junior-form";

export default async function MorePage() {
  const me = await requireUser();
  const { t, lang } = await getT();
  const isAdmin = me.role === "ADMIN";
  const [users, activity] = isAdmin ? await Promise.all([listUsers(), recentActivity()]) : [[], []];

  return (
    <>
      <PageHeader title={me.name} />
      <p className="-mt-4 mb-6 text-ink-soft">{isAdmin ? t.admin : t.junior}</p>

      <div className="flex items-center justify-between border-y border-rule py-4">
        <span className="text-[19px] font-bold">{t.language}</span>
        <LanguageSwitch />
      </div>

      {isAdmin && (
        <>
          <SectionTitle>{t.team}</SectionTitle>
          <ul className="ruled">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[18px] font-bold ${u.active ? "" : "text-ink-faint line-through"}`}>
                    {u.name}
                  </p>
                  <p className="text-[14px] text-ink-soft">
                    {u.username} · {u.role === "ADMIN" ? t.admin : t.junior}
                  </p>
                </div>
                {u.id !== me.uid && (
                  <form action={toggleUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <button className="rounded-md border-2 border-rule px-3 py-1.5 text-[15px] font-bold">
                      {u.active ? t.deactivate : t.activate}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          <AddJuniorForm />

          <SectionTitle>{t.activity}</SectionTitle>
          {activity.length ? (
            <ul className="ruled">
              {activity.map((a) => (
                <li key={a.id} className="py-2.5">
                  <p className="text-[16px]">{a.detail}</p>
                  <p className="text-[13px] text-ink-soft">
                    {a.user?.name ?? "-"} ·{" "}
                    {fmtDay(a.createdAt, lang, {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Asia/Kolkata",
                    })}{" "}
                    <Stamp>{a.action.split("_")[0].toLowerCase()}</Stamp>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-ink-faint">-</p>
          )}
        </>
      )}

      <form action={logout} className="mt-10">
        <button className={`${buttonStyles.danger} w-full`}>
          <LogOut size={20} /> {t.logout}
        </button>
      </form>
    </>
  );
}
