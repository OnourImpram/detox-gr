import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { t } from "@/lib/i18n";
import { localeFromSearch } from "@/lib/seo";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const locale =
    typeof window === "undefined"
      ? "tr"
      : localeFromSearch(Object.fromEntries(new URLSearchParams(window.location.search)));
  void error;
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <span className="text-primary" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-2xl">{t(locale, "error.title")}</h1>
      <p className="max-w-md text-sm text-muted">{t(locale, "error.reload")}</p>
    </main>
  );
}
