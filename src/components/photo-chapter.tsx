import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";

export function PhotoChapter({
  src,
  altKey,
  ken = false,
  portrait = false,
  minClass = "min-h-[80dvh]",
  children,
  caption = true,
  priority = false,
}: {
  src: string;
  altKey: string;
  ken?: boolean;
  portrait?: boolean;
  minClass?: string;
  children: React.ReactNode;
  caption?: boolean;
  priority?: boolean;
}) {
  const locale = useLocale();
  return (
    <section>
      <div className={`relative overflow-hidden ${minClass}`}>
        <div
          className={`hero-still ${ken ? "hero-still-ken" : ""} ${portrait ? "hero-still-portrait" : ""}`}
        >
          <Pic
            src={src}
            alt={t(locale, altKey)}
            sizes="100vw"
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/48 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/74 via-ink/22 to-transparent sm:from-ink/56" />
        <div
          className={`relative z-10 on-photo flex ${minClass} flex-col justify-end shell-x pt-32 pb-16`}
        >
          {children}
        </div>
      </div>
      {caption ? (
        <p className="photo-credit shell-x">{t(locale, altKey)}</p>
      ) : null}
    </section>
  );
}
