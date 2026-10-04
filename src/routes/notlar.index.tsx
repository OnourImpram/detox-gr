import { createFileRoute } from '@tanstack/react-router';
import { EditorialHeader, JournalCards, ContactCta } from '@/components/editorial';
import { b } from '@/lib/brand-copy';
import { localeFromSearch, pageOrigin, seoHead } from '@/lib/seo';
export const Route = createFileRoute('/notlar/')({
  head: ({ match }) => {const locale=localeFromSearch(match.search);return seoHead({title:`${b(locale,'journal.title')} | Detoks`,description:b(locale,'journal.lead'),path:'/notlar',locale,origin:pageOrigin()});},
  component: () => <><div className="ed-container"><EditorialHeader title="journal.title" lead="journal.lead" /></div><JournalCards heading={false} /><ContactCta /></>,
});
