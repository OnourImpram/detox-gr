/** Compose a shareable link for both root domains and project-path deployments. */
export function storefrontHref(origin: string, basePath: string, path: string): string {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) throw new TypeError('Expected an internal path');
  const base = basePath.replace(/\/$/, '');
  const prefixed = !base || path === base || path.startsWith(`${base}/`) ? path : `${base}${path}`;
  if (!origin) return prefixed;
  const root = new URL(origin);
  if (!['http:', 'https:'].includes(root.protocol) || root.username || root.password) throw new TypeError('Invalid storefront origin');
  return new URL(prefixed, root.origin).href;
}
