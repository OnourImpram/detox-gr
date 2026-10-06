import { useId, useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, Phone } from 'lucide-react';
import { SHOP_PHONE_TEL, SHOP_PHONE_DISPLAY, SHOP_WHATSAPP } from '@/lib/shop-facts';
import { useLocale } from '@/lib/use-locale';
import { b } from '@/lib/brand-copy';
import { r } from '@/lib/refinement-copy';
import { Button } from './ui/button';

/** A customer can inspect and copy a request without using an external messaging account. */
export function MessageActions({ message, primaryLabel, testId = 'inquiry-link' }: { message: string; primaryLabel?: string; testId?: string }) {
  const locale = useLocale();
  const id = useId();
  const text = useRef<HTMLTextAreaElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<'idle' | 'copied' | 'manual'>('idle');
  const url = new URL(SHOP_WHATSAPP);
  url.searchParams.set('text', message);
  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(message);
      setStatus('copied');
    } catch {
      setStatus('manual');
      setExpanded(true);
      requestAnimationFrame(() => { text.current?.focus({ preventScroll: true }); text.current?.select(); });
    }
  }
  return <div className="customer-message" data-testid="message-actions">
    <div className="customer-message__buttons">
      <Button asChild variant="primary"><a href={url.href} target="_blank" rel="noopener noreferrer" data-testid={testId}>{primaryLabel ?? b(locale, 'inquiry.action')}<ArrowUpRight size={17} aria-hidden="true" /></a></Button>
      <Button type="button" variant="outline" onClick={() => { void copy(); }} aria-controls={id} data-testid="copy-message">{status === 'copied' ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}{r(locale, 'copy')}</Button>
    </div>
    <p role="status" aria-live="polite" className="customer-message__status">{status === 'idle' ? '' : r(locale, status === 'copied' ? 'copied' : 'manual')}</p>
    <details open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary>{r(locale, 'preview')}</summary>
      <label className="sr-only" htmlFor={id}>{r(locale, 'preview')}</label>
      <textarea ref={text} id={id} readOnly value={message} rows={7} spellCheck={false} />
    </details>
    <a className="customer-message__phone" href={`tel:${SHOP_PHONE_TEL}`}><Phone size={16} aria-hidden="true" /><span>{r(locale, 'call')}<strong>{SHOP_PHONE_DISPLAY}</strong></span></a>
  </div>;
}
