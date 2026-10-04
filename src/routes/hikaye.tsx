import { createFileRoute } from '@tanstack/react-router';
import { b } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';
import { EDITORIAL_PHOTOS as PHOTO } from '@/lib/photo-archive';
import { ArchivePhoto } from '@/components/archive-photo';
import { EditorialHeader, ContactCta } from '@/components/editorial';
import { localeFromSearch, pageOrigin, seoHead, aboutJsonLd } from '@/lib/seo';
export const Route = createFileRoute('/hikaye')({
  head: ({ match }) => { const locale = localeFromSearch(match.search);return seoHead({ title: `${b(locale, 'story.title')} | Detoks`, description: b(locale, 'story.lead'), path: '/hikaye', locale, origin: pageOrigin(), jsonLd: [aboutJsonLd(pageOrigin(), locale)] }); },
  component: Story,
});
function Story() {
  const locale = useLocale();
  return <><article className="ed-story ed-container"><EditorialHeader title="story.title" lead="story.lead" kicker="story.kicker" />
    <div className="ed-story-intro"><ArchivePhoto original={PHOTO.cloves} priority sizes="(min-width: 900px) 60vw, 100vw" /><p className="ed-pullquote">{b(locale, 'story.closing')}</p></div>
    <div className="ed-story-chapters">{([1,2,3] as const).map((n, i) => <section key={n}><div><span className="ed-chapter-mark" aria-hidden="true">{n}</span><h2>{b(locale, `story.heading${n}`)}</h2><p>{b(locale, `story.body${n}`)}</p></div><ArchivePhoto original={[PHOTO.seeds,PHOTO.rose,PHOTO.cinnamon][i]} sizes="(min-width: 900px) 40vw, 100vw" /></section>)}</div>
  </article><ContactCta /></>;
}
