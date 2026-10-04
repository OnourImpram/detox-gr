import { createFileRoute, notFound } from '@tanstack/react-router';
import { JOURNAL, ContactCta } from '@/components/editorial';
import { ArchivePhoto } from '@/components/archive-photo';
import { LocaleLink } from '@/components/locale-link';
import { b } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';
import { localeFromSearch, pageOrigin, seoHead } from '@/lib/seo';
export const Route = createFileRoute('/notlar/$slug')({
  loader: ({ params }) => {if(!JOURNAL.some(note=>note.slug===params.slug))throw notFound();},
  head: ({match}) => {const locale=localeFromSearch(match.search);const note=JOURNAL.find(note=>note.slug===match.params.slug);return note ? seoHead({title:`${b(locale,`${note.key}.title`)} | Detoks`,description:b(locale,`${note.key}.deck`),path:`/notlar/${note.slug}`,locale,origin:pageOrigin()}) : {};},
  component: Note,
});
function Note(){
  const locale=useLocale();const {slug}=Route.useParams();const note=JOURNAL.find(note=>note.slug===slug);
  if(!note)throw notFound();
  return <><article className="ed-note ed-container"><LocaleLink to="/notlar" className="ed-link">{b(locale,'journal.back')}</LocaleLink><header><p className="ed-eyebrow">{b(locale,'journal.title')}</p><h1>{b(locale,`${note.key}.title`)}</h1><p className="ed-lead">{b(locale,`${note.key}.deck`)}</p></header><ArchivePhoto original={note.image} priority sizes="(min-width: 1024px) 70vw, 100vw" /><div className="ed-note-prose">{([1,2,3] as const).map(n=><p key={n}>{b(locale,`${note.key}.body${n}`)}</p>)}</div><LocaleLink to="/shop" className="ed-link">{b(locale,'hero.cta')}</LocaleLink></article><ContactCta /></>;
}
