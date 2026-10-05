/** Shared by the browser catalogue and static hosting. Display edits never change URLs. */
export type SourceAddress = { source_record_id: string; source_name: string; editorial_title_candidate?: string | null };
const OVERRIDE: Readonly<Record<string,string>> = { DT054: 'Kuyruk yağı kremi' };
const TR: Readonly<Record<string,string>> = { ç:'c',ğ:'g',ı:'i',ö:'o',ş:'s',ü:'u',â:'a',î:'i',û:'u' };
export function cleanProductTitle(value: string): string {
  const name=value.replace(/\(\s*DETOKS AKTAR(?:\s+özel yapım)?\s*,?\s*/gi,'(').replace(/\(\s*\)/g,'')
    .replace(/\s*DETOKS AKTAR(?:\s+özel yapım)?/gi,'').replace(/\s{2,}/g,' ').replace(/\s+,/g,',').trim();
  return name?name.charAt(0).toLocaleUpperCase('tr-TR')+name.slice(1):name;
}
export function sourceProductTitle(row: SourceAddress): string {
  return cleanProductTitle(OVERRIDE[row.source_record_id]?.trim() || row.editorial_title_candidate?.trim() || row.source_name.trim());
}
export function slugifySourceTitle(title: string): string {
  return title.toLocaleLowerCase('tr-TR').split('').map(c=>TR[c]??c).join('')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72);
}
export function sourceProductSlugs(rows: readonly SourceAddress[]): string[] {
  const used=new Set<string>();
  return rows.map(row=>{
    const base=slugifySourceTitle(sourceProductTitle(row));
    const slug=used.has(base)?`${base}-${row.source_record_id.toLowerCase()}`:base;
    used.add(slug);return slug;
  });
}
