import { strict as assert } from "node:assert";
import { test } from "node:test";
import { shopStatus } from "./shop-status.ts";

// SHOP_HOURS: Pzt/Çar/Cum/Cmt 09:30–14:30 · Sal/Per 09:30–14:30 ve 18:00–21:00 · Pazar kapalı.
// Tarihler UTC verilir; Europe/Athens yazın UTC+3, kışın UTC+2 — testler iki kolu da kapsar.
const at = (iso: string) => new Date(iso);

test("hafta içi öğlen açık, bitiş saatini söyler", () => {
  // 2026-09-21 Pazartesi 11:00 Atina (UTC+3 → 08:00Z)
  const s = shopStatus(at("2026-09-21T08:00:00Z"));
  assert.equal(s.open, true);
  assert.equal(s.until, "14:30");
});

test("öğleden sonra kapalı, aynı gün ikinci slotu verir (Salı)", () => {
  // 2026-09-22 Salı 15:00 Atina → kapalı, 18:00'de açılır
  const s = shopStatus(at("2026-09-22T12:00:00Z"));
  assert.equal(s.open, false);
  assert.deepEqual(s.next, { day: 2, time: "18:00" });
});

test("Salı akşam slotunda açık", () => {
  const s = shopStatus(at("2026-09-22T16:00:00Z")); // 19:00 Atina
  assert.equal(s.open, true);
  assert.equal(s.until, "21:00");
});

test("Pazar kapalı, Pazartesi sabahını gösterir", () => {
  // 2026-09-20 Pazar 12:00 Atina
  const s = shopStatus(at("2026-09-20T09:00:00Z"));
  assert.equal(s.open, false);
  assert.deepEqual(s.next, { day: 1, time: "09:30" });
});

test("kış saati (UTC+2) kaymaz", () => {
  // 2026-01-07 Çarşamba 10:00 Atina = 08:00Z
  const s = shopStatus(at("2026-01-07T08:00:00Z"));
  assert.equal(s.open, true);
  // aynı an UTC+3 varsayılsaydı 11:00 olurdu — ikisi de açık; ayrım açılış sınırında görülür:
  const erken = shopStatus(at("2026-01-07T07:00:00Z")); // 09:00 Atina, henüz kapalı
  assert.equal(erken.open, false);
  assert.deepEqual(erken.next, { day: 3, time: "09:30" });
});
