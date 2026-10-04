import { SHOP_HOURS } from "./shop-facts.ts";

/**
 * "Şu an açık mı" — dükkânın ilan edilmiş saatlerinden (SHOP_HOURS, Europe/Athens) hesaplanır.
 * Sunucuda çağrılmaz: SSR ile istemci arasındaki saat farkı hidrasyon uyuşmazlığı yaratır (bileşen mount sonrası okur).
 * Uydurma yok: saat verisi Taha'nın ilan ettiği saatler; tatil/istisna bilinmiyor, o yüzden metin "ilan edilen saatler" der.
 */
export type ShopStatus = { open: boolean; until: string | null; next: { day: number; time: string } | null };

function athensNow(now = new Date()) {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Athens",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(f.formatToParts(now).map((p) => [p.type, p.value]));
  const wd = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[parts.weekday as string] ?? 7;
  return { day: wd, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Günün slotları: [başlangıç, bitiş] dakika çiftleri. Listede olmayan gün kapalı (Pazar). */
function slotsFor(day: number): [number, number][] {
  const row = SHOP_HOURS.find((r) => (r.days as readonly number[]).includes(day));
  if (!row) return [];
  return row.slots.map((s) => {
    const [a, b] = s.split("–");
    return [toMinutes(a), toMinutes(b)] as [number, number];
  });
}

export function shopStatus(now = new Date()): ShopStatus {
  const { day, minutes } = athensNow(now);
  for (const [a, b] of slotsFor(day)) {
    if (minutes >= a && minutes < b) {
      const hh = String(Math.floor(b / 60)).padStart(2, "0");
      const mm = String(b % 60).padStart(2, "0");
      return { open: true, until: `${hh}:${mm}`, next: null };
    }
  }
  // Bugünün kalan slotu ya da sonraki 7 gün içindeki ilk açılış
  for (let i = 0; i < 8; i++) {
    const d = ((day - 1 + i) % 7) + 1;
    for (const [a] of slotsFor(d)) {
      if (i === 0 && a <= minutes) continue;
      const hh = String(Math.floor(a / 60)).padStart(2, "0");
      const mm = String(a % 60).padStart(2, "0");
      return { open: false, until: null, next: { day: d, time: `${hh}:${mm}` } };
    }
  }
  return { open: false, until: null, next: null };
}
