import { Link } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { applyLang } from "@/lib/lang-search";

export function LocaleLink(props: Record<string, unknown>) {
  const locale = useLocale();
  const incoming = props.search;
  const search =
    typeof incoming === "function"
      ? (prev: Record<string, unknown>) =>
          applyLang((incoming as (p: Record<string, unknown>) => Record<string, unknown>)(prev), locale)
      : applyLang({ ...((incoming as object | undefined) ?? {}) } as Record<string, unknown>, locale);
  return <Link {...(props as React.ComponentProps<typeof Link>)} search={search as never} />;
}
