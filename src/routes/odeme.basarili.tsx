import { createFileRoute } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { useEffect, useState } from "react";
import { LocaleLink } from "@/components/locale-link";
import { readCheckout } from "@/lib/checkout";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang-search";
import { formatMoney } from "@/lib/money";
import { localeFromSearch, pageOrigin, seoHead, BRAND } from "@/lib/seo";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/odeme/basarili")({
  validateSearch: (s: Record<string, unknown>) => ({
    ...parseLang(s),
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: `${t(locale, "order.paid")} | ${BRAND}`,
      description: t(locale, "order.paidLead"),
      path: "/odeme/basarili",
      locale,
      origin: pageOrigin(),
      noindex: true,
    });
  },
  component: Paid,
});

function Paid() {
  const { session_id: sessionId } = Route.useSearch();
  const locale = useLocale();
  const clear = useShop((s) => s.clear);
  const [state, setState] = useState<"load" | "paid" | "miss">("load");
  const [amount, setAmount] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setState("miss");
      return;
    }
    void readCheckout({ data: { sessionId } })
      .then((res) => {
        if (res.ok && res.paid) {
          setAmount(res.amountEur);
          setEmail(res.email);
          clear();
          setState("paid");
        } else setState("miss");
      })
      .catch(() => setState("miss"));
  }, [sessionId, clear]);

  if (state === "load") {
    return (
      <section className="px-[6vw] py-16">
        <h1 className="text-4xl">{t(locale, "checkout.wait")}</h1>
      </section>
    );
  }
  if (state !== "paid") {
    return (
      <section className="px-[6vw] py-16">
        <h1 className="text-4xl">{t(locale, "order.missing")}</h1>
        <LocaleLink to="/sepet" className="mt-4 inline-block text-primary">
          {t(locale, "cart.title")}
        </LocaleLink>
      </section>
    );
  }
  return (
    <section className="px-[6vw] py-12">
      <p className="text-xs tracking-[0.18em] text-patina uppercase">{t(locale, "order.paid")}</p>
      <h1 className="mt-2 text-4xl">{t(locale, "order.paidLead")}</h1>
      {email && <p className="mt-3 text-muted">{email}</p>}
      <p className="mt-6 font-medium tabular-nums">{t(locale, "order.total", { total: formatMoney(amount, "EUR", locale) })}</p>
      <p className="mt-4 max-w-[48ch] text-sm text-muted">{t(locale, "order.paidNote")}</p>
      <LocaleLink to="/shop" className="mt-8 inline-block text-primary">
        {t(locale, "order.continue")}
      </LocaleLink>
    </section>
  );
}
