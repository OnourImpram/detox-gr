import { BRAND } from "@/lib/seo";

const SIZES = {
  nav: "font-display text-[1.35rem] font-extrabold tracking-tight leading-none",
  hero: "font-display text-[clamp(3rem,8vw,6rem)] font-extrabold tracking-tight leading-[0.9]",
  footer: "font-display text-[2.4rem] font-extrabold tracking-tight leading-none",
} as const;

export function BrandMark({
  size = "nav",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span className={`${SIZES[size]} ${className}`} aria-label={BRAND}>
      Detoks<span className="text-patina">.gr</span>
    </span>
  );
}
