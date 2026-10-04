import { useEffect } from "react";

export function ScrollProgress() {
  useEffect(() => {
    const root = document.documentElement;
    const onScroll = () => {
      const max = root.scrollHeight - root.clientHeight;
      root.style.setProperty("--scroll", max > 0 ? String(window.scrollY / max) : "0");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" aria-hidden="true" />;
}
