import { useEffect } from "react";

/** Tek tema: "pine" (ceviz lake + bakır; kilitli). Atölye/tasarım laboratuvarı rotası ve tema deposu kaldırıldı (2026-09-22). */
export function ThemeRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = "pine";
  }, []);
  return <>{children}</>;
}
