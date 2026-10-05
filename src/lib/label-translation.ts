/** Immutable locale glossaries are compiled once, rather than sorted per product card. */
type Glossary = readonly (readonly [string, string])[];
type Rule = { source: string; value: string };
const compiled = new WeakMap<Glossary, { exact: Map<string, string>; rules: Rule[] }>();
const fold = (value: string) => value.toLocaleLowerCase('tr-TR');
const whole = (value: string) => fold(value.trim().replace(/\s+/g, ' '));
const word = (value: string | undefined) => Boolean(value && /[\p{L}\p{N}]/u.test(value));
function compile(glossary: Glossary) {
  const cached = compiled.get(glossary);
  if (cached) return cached;
  const exact = new Map<string, string>();
  const rules: Rule[] = [];
  for (const [source, value] of glossary) {
    if (!source.trim()) continue;
    if (!exact.has(whole(source))) exact.set(whole(source), value);
    rules.push({ source: fold(source), value });
  }
  rules.sort((a, b) => b.source.length - a.source.length);
  const result = { exact, rules };
  compiled.set(glossary, result);
  return result;
}
/** Full phrases first. Boundaries prevent replacing a word inside a brand name. */
export function translateLabel(text: string, glossary: Glossary): string {
  const { exact, rules } = compile(glossary);
  const match = exact.get(whole(text));
  if (match !== undefined) return match;
  const input = fold(text);
  let index = 0;
  let output = '';
  while (index < text.length) {
    const rule = rules.find(row => input.startsWith(row.source, index)
      && !(word(input[index - 1]) && word(row.source[0]))
      && !(word(row.source.at(-1)) && word(input[index + row.source.length])));
    if (rule) { output += rule.value; index += rule.source.length; }
    else { output += text[index]; index++; }
  }
  return output;
}
