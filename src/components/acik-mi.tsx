import { useEffect, useState } from "react";
import { shopStatus, type ShopStatus } from "@/lib/shop-status";
import { t } from "@/lib/i18n";
import { localeMeta } from "@/lib/i18n-locales";
import { useLocale } from "@/lib/use-locale";

/**
 * "Şimdi açık · 14:30'a kadar" / "Kapalı · Salı 09:30'da açılır" — ilan edilen saatlerden (Europe/Athens).
 * Mount sonrası hesaplanır: SSR'da saat basmak hidrasyon uyuşmazlığı yaratır ve önbelleğe bayat saat girer.
 */
export function AcikMi({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const [durum, setDurum] = useState<ShopStatus | null>(null);
  useEffect(() => {
    setDurum(shopStatus());
    const id = setInterval(() => setDurum(shopStatus()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (!durum) return null;
  const gun = durum.next
    ? new Intl.DateTimeFormat(localeMeta(locale).html, { weekday: "long" }).format(new Date(Date.UTC(2024, 0, durum.next.day)))
    : "";
  return (
    <p className={`micro flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" className={`inline-block size-2 rounded-full ${durum.open ? "bg-patina" : "bg-faint"}`} />
      {durum.open
        ? t(locale, "shop.openNow", { time: durum.until ?? "" })
        : t(locale, "shop.closedNow", { day: gun, time: durum.next?.time ?? "" })}
    </p>
  );
}
