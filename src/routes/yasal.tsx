import { createFileRoute } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { LocaleLink } from "@/components/locale-link";
import { t } from "@/lib/i18n";
import { localeFromSearch, pageOrigin, seoHead } from "@/lib/seo";

export const Route = createFileRoute("/yasal")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: t(locale, "seo.legal.title"),
      description: t(locale, "seo.legal.desc"),
      path: "/yasal",
      locale,
      origin: pageOrigin(),
    });
  },
  component: Legal,
});

// Bölümler: başlık anahtarı + satır anahtarları. Satırlar olgusal (kod/doğrulanmış) ya da görünür bekleyen-onay etiketi taşır.
// Metinler danışman onayından geçmeden "yasal metin" sayılmaz; etiketler kaldırılmadan lansman yapılmaz (red team RT-B-03/04/11).
const SECTIONS = [
  { title: "legal.s1", rows: ["legal.s1a", "legal.s1b", "legal.s1c"] },
  { title: "legal.s2", rows: ["legal.s2a", "legal.s2b", "legal.s2c", "legal.s2d", "legal.s2e"] },
  { title: "legal.s3", rows: ["legal.s3a", "legal.s3b", "legal.s3c"] },
  { title: "legal.s4", rows: ["legal.s4a", "legal.s4b", "legal.s4c", "legal.s4d", "legal.s4e"] },
  { title: "legal.s5", rows: ["legal.s5a"] },
  { title: "legal.s6", rows: ["legal.s6a"] },
  { title: "legal.s7", rows: ["legal.s7a", "legal.s7b"] },
] as const;
const PENDING = /\[(DANIŞMAN|OPERATÖR|TAHA|CONSULTANT|OPERATOR)[^\]]*\]/;

function Legal() {
  const locale = useLocale();
  return (
    <section className="mx-auto max-w-2xl px-[6vw] py-14">
      <p className="kicker">{t(locale, "legal.kicker")}</p>
      <h1 className="mt-3 text-[clamp(1.9rem,5vw+0.5rem,4rem)]">{t(locale, "legal.title")}</h1>
      <p className="mt-4 text-muted">{t(locale, "legal.lead")}</p>
      <p className="mt-6 border border-border bg-raised px-4 py-3 text-sm text-patina">{t(locale, "legal.draftNote")}</p>
      {SECTIONS.map((sec) => (
        <section key={sec.title} className="mt-10">
          <h2 className="text-2xl">{t(locale, sec.title)}</h2>
          <ul className="mt-4 space-y-3 text-muted">
            {sec.rows.map((key) => {
              const text = t(locale, key);
              const pending = PENDING.test(text);
              return (
                <li key={key} className={`hairline-soft border-t pt-3 ${pending ? "text-faint" : ""}`}>
                  {text}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="mt-10 text-sm">
        <LocaleLink to="/iletisim" className="text-primary hover:text-fg">
          {t(locale, "nav.contact")}
        </LocaleLink>
      </p>
    </section>
  );
}
