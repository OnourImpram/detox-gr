import { Outlet, createFileRoute } from "@tanstack/react-router";
import { parseLang } from "@/lib/lang-search";

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>) => ({
    ...parseLang(s),
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: () => <Outlet />,
});
