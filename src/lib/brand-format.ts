/** Interpolation must not silently publish an unresolved content placeholder. */
export function interpolateBrand(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_match, key: string) => {
    if (!(key in values)) throw new Error(`Missing brand value: ${key}`);
    return String(values[key]);
  });
}
