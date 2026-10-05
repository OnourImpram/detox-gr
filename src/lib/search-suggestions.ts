import { normalizeSearch } from './discovery.ts';
function distance(left:string,right:string):number {
  let previous=Array.from({length:right.length+1},(_,i)=>i);
  for(let i=0;i<left.length;i++){
    const current=[i+1];
    for(let j=0;j<right.length;j++)current.push(Math.min(current[j]+1,previous[j+1]+1,previous[j]+Number(left[i]!==right[j])));
    previous=current;
  }
  return previous[right.length];
}
/** Suggestions come only from this catalogue. They never change an entered query automatically. */
export function suggestSearch(query:string,labels:readonly string[],limit=3):string[]{
  const needle=normalizeSearch(query);
  if(needle.length<4 || needle.length>32 || needle.includes(' '))return [];
  const words=new Map<string,string>();
  for(const label of labels)for(const word of label.match(/[\p{L}]{4,}/gu)??[]){const normalized=normalizeSearch(word);if(!words.has(normalized))words.set(normalized,word);}
  return [...words].map(([key,label])=>({label,score:distance(needle,key),length:key.length}))
    .filter(item=>item.score>0 && item.score<=Math.min(2,Math.floor(needle.length/3)))
    .sort((a,b)=>a.score-b.score || Math.abs(a.length-needle.length)-Math.abs(b.length-needle.length) || a.label.localeCompare(b.label))
    .slice(0,Math.max(0,Math.min(limit,3))).map(item=>item.label);
}
