import { MessageCircle, Phone } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/phone";
import type { Dictionary } from "@/i18n/dictionary";

export function ContactButtons({ phone, t }: { phone: string | null; t: Dictionary }) {
  if (!phone) return null;
  const cls = "flex h-11 items-center gap-1.5 rounded-md border-2 border-ink px-3 text-[16px] font-bold";
  return (
    <div className="flex gap-2">
      <a href={telLink(phone)} className={cls}>
        <Phone size={18} /> {t.call}
      </a>
      <a href={whatsappLink(phone)} target="_blank" rel="noreferrer" className={`${cls} border-green text-green`}>
        <MessageCircle size={18} /> {t.whatsapp}
      </a>
    </div>
  );
}
