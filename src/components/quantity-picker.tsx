import {useEffect,useId,useState} from 'react';
import {Minus,Plus} from 'lucide-react';
import {normalizeListQuantity,quantityRule,validListQuantity} from '@/lib/list-quantity';
import {refinement} from '@/lib/refinement-copy';
import {useLocale} from '@/lib/use-locale';
export function QuantityPicker({value,unit,name,onChange,compact=false}:{value:number;unit:string;name:string;onChange:(value:number)=>void;compact?:boolean}){
 const locale=useLocale();const id=useId();const rule=quantityRule(unit);const [draft,setDraft]=useState(String(value));
 useEffect(()=>setDraft(String(value)),[value]);
 const number=new Intl.NumberFormat(locale==='no'?'nb':locale);
 function commit(){const next=normalizeListQuantity(Number(draft.replace(',','.')),unit);setDraft(String(next));onChange(next);}
 const label=`${refinement(locale,'quantity')}. ${name}`;
 return <div className={`rf-quantity ${compact?'is-compact':''}`}>
  <label htmlFor={id}>{refinement(locale,'quantity')} <span>{unit==='kg'?'kg':refinement(locale,'pieces')}</span></label>
  <div className="dt-quantity">
   <button type="button" disabled={value<=rule.min} aria-label={`${label}. −`} onClick={()=>onChange(normalizeListQuantity(value-rule.step,unit))}><Minus size={16} aria-hidden="true"/></button>
   <input id={id} type="text" role="spinbutton" inputMode={unit==='kg'?'decimal':'numeric'} aria-valuemin={rule.min} aria-valuemax={rule.max} aria-valuenow={value} aria-valuetext={`${number.format(value)} ${unit==='kg'?'kg':refinement(locale,'pieces')}`} aria-label={label} value={draft} onChange={event=>{const text=event.target.value;setDraft(text);const number=Number(text.replace(",","."));if(validListQuantity(number,unit))onChange(number);}} onBlur={commit} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();commit();}if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();onChange(normalizeListQuantity(value+(event.key==='ArrowUp'?rule.step:-rule.step),unit));}}}/>
   <button type="button" disabled={value>=rule.max} aria-label={`${label}. +`} onClick={()=>onChange(normalizeListQuantity(value+rule.step,unit))}><Plus size={16} aria-hidden="true"/></button>
  </div>
  {unit==='kg'&&!compact&&<div className="rf-weight-presets" role="group" aria-label={label}>{[.25,.5,1].map(amount=><button key={amount} type="button" aria-pressed={value===amount} onClick={()=>onChange(amount)}>{amount<1?`${number.format(amount*1000)} g`:'1 kg'}</button>)}</div>}
 </div>;
}
