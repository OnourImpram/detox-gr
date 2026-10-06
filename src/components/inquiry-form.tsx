import { useState, useId } from 'react';
import { MessageActions } from './message-actions';
import { b } from '@/lib/brand-copy';
import { buildInquiry } from '@/lib/inquiry';
import { countryName } from '@/lib/i18n';
import { COUNTRIES } from '@/lib/markets';
import { SHOP_WHATSAPP } from '@/lib/shop-facts';
import { useLocale } from '@/lib/use-locale';
import { useShop } from '@/lib/store';

export function InquiryForm({ kind }: { kind: 'gift' | 'trade' | 'contact' }) {
  const locale = useLocale();
  const country = useShop(state => state.country);
  const setCountry = useShop(state => state.setCountry);
  const [concept, setConcept] = useState<'one' | 'two' | 'three'>('one');
  const [budget, setBudget] = useState('');
  const [note, setNote] = useState('');
  const id = useId();
  const href = buildInquiry({ heading: `${b(locale, 'inquiry.intro')}\n${b(locale, `${kind}.title`)}`, country,
    concept: kind === 'gift' ? b(locale, `gift.${concept}`) : undefined,
    budget: budget ? `${b(locale, 'inquiry.budget')}. ${budget}` : '', note }, SHOP_WHATSAPP);
  return <div className="ed-inquiry" data-testid="inquiry-form">
    <p className="ed-eyebrow">{b(locale, 'inquiry.intro')}</p>
    {kind === 'gift' && <fieldset><legend>{b(locale, 'gift.choose')}</legend><div className="ed-concepts">{(['one','two','three'] as const).map(key => <label key={key}><input type="radio" name={`${id}-concept`} checked={concept === key} onChange={() => setConcept(key)} /><span>{b(locale, `gift.${key}`)}</span></label>)}</div></fieldset>}
    <div className="ed-inquiry-fields"><label>{b(locale, 'inquiry.country')}<select value={country} onChange={event => setCountry(event.target.value as typeof country)}>{COUNTRIES.map(item => <option key={item.code} value={item.code}>{countryName(item.code, locale)}</option>)}</select></label>
      {kind !== 'contact' && <label>{b(locale, 'inquiry.budget')}<input maxLength={80} value={budget} onChange={event => setBudget(event.target.value)} /></label>}
    </div>
    <label>{b(locale, 'inquiry.note')}<textarea rows={5} maxLength={1000} value={note} onChange={event => setNote(event.target.value)} /></label>
    <MessageActions message={new URL(href).searchParams.get("text") ?? ""} />
    <p className="ed-form-note">{b(locale, 'inquiry.privacy')}</p>
  </div>;
}
