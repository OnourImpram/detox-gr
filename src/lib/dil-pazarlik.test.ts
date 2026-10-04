import { strict as assert } from "node:assert";
import { test } from "node:test";
import { bestLocale } from "./dil-pazarlik.ts";

test("q ağırlığı sırayı belirler, ülke eki düşer", () => {
  assert.equal(bestLocale("de-DE,de;q=0.9,en;q=0.8"), "de");
  assert.equal(bestLocale("en;q=0.4,el-GR;q=0.9"), "el");
  assert.equal(bestLocale("fr-CA"), "fr");
});

test("Norveççe iki yazımdan da no'ya düşer", () => {
  assert.equal(bestLocale("nb-NO,nb;q=0.9"), "no");
  assert.equal(bestLocale("nn"), "no");
});

test("desteklenmeyen dil atlanır, sıradaki desteklenene geçilir", () => {
  assert.equal(bestLocale("ja-JP,ja;q=0.9,it;q=0.5"), "it");
});

test("joker, boş ve tanınmayan giriş null döner (TR kalır)", () => {
  assert.equal(bestLocale("*"), null);
  assert.equal(bestLocale(""), null);
  assert.equal(bestLocale(undefined), null);
  assert.equal(bestLocale("ja,ko,zh"), null);
});

test("Türkçe tercih edildiğinde tr döner — çağıran yönlendirmez", () => {
  assert.equal(bestLocale("tr-TR,tr;q=0.9,en;q=0.8"), "tr");
});
