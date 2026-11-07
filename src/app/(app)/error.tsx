"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useT } from "@/components/i18n";
import { buttonStyles } from "@/components/ui";

/** Friendly message instead of a broken screen if something fails. */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  const { t } = useT();
  return (
    <div className="card mt-10 p-6 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red/10 text-red">
        <AlertTriangle size={28} />
      </span>
      <p className="mt-4 text-[20px] font-bold">{t.errorTitle}</p>
      <button type="button" onClick={reset} className={`${buttonStyles.primary} mt-6 w-full`}>
        <RotateCcw size={20} /> {t.tryAgain}
      </button>
    </div>
  );
}
