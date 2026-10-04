import type { ImgHTMLAttributes } from "react";
import manifestRaw from "@/data/gorsel-turev.json";

// WebP türevleri (scripts/gorsel-turev.py): tam boy + 1200 + 800. Manifestte olmayan yol düz <img> olarak basılır.
const MANIFEST = manifestRaw as Record<string, { w: number; h: number; widths: number[] }>;

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; sizes?: string };

/** <picture> ile WebP srcset; boyut bilgisi CLS'yi önler (red team RT-C-10). */
export function Pic({ src, alt, sizes = "100vw", className, ...rest }: Props) {
  const m = MANIFEST[src];
  if (!m) return <img src={src} alt={alt} className={className} {...rest} />;
  const base = src.replace(/\.jpe?g$/i, "");
  const srcSet = m.widths.map((w) => `${w === m.w ? `${base}.webp` : `${base}-${w}.webp`} ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img src={src} alt={alt} width={m.w} height={m.h} className={className} {...rest} />
    </picture>
  );
}
