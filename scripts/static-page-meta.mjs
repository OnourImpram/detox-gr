import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sourceProductSlugs, sourceProductTitle } from '../src/lib/catalog-address.ts';

const SITE = 'https://onourimpram.github.io/detox-gr';
const cache = new Map();
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function data(root) {
  if (!cache.has(root)) {
    const read = path => JSON.parse(readFileSync(join(root,path),'utf8'));
    const rows = read('src/data/catalog-vitrin.json');
    cache.set(root, { rows, slugs: sourceProductSlugs(rows), brand: read('src/data/brand/tr.json'), scenes: read('src/data/generated-scenes.json').scenes });
  }
  return cache.get(root);
}
/** A static preview cannot negotiate a query-string locale for link crawlers.
 * Its initial head is explicit Turkish content for the correct route, never a copied home title.
 * Hydrated content and metadata still follow the user's selected locale. */
export function describeRoute(path, projectRoot, base = SITE) {
  const { rows, slugs, brand, scenes } = data(projectRoot);
  const route = path.replace(/\/$/,'') || '/';
  const absolute = value => /^https?:\/\//.test(value) ? value : `${base.replace(/\/$/,'')}/${value.replace(/^\//,'')}`;
  const result = { title: '404. Sayfa bulunamadı | Detoks.gr', description: 'Aradığınız sayfa bulunamadı. Detoks Aktar ürünlerine mağaza üzerinden ulaşabilirsiniz.', image: absolute('/og.jpg'), url: absolute(route) + '?lang=tr' };
  const pages = {
    '/': ['hero.title','hero.lead'], '/hikaye': ['story.title','story.lead'], '/raf': ['archive.title','archive.lead'],
    '/notlar': ['journal.title','journal.lead'], '/paket': ['gift.title','gift.body'], '/ticari': ['trade.title','trade.body'],
    '/iletisim': ['contact.title','contact.lead'], '/teslimat': ['delivery.title','delivery.body'], '/yasal': ['legal.title','legal.body'],
    '/notlar/etiketin-anlattiklari': ['note1.title','note1.deck'], '/notlar/dusunulmus-bir-hediye': ['note2.title','note2.deck'],
    '/notlar/gumulcinede-bir-dukkan': ['note3.title','note3.deck'],
  };
  const titles = {'/shop':'Ürünler','/kompozisyonlar':'Ürün kompozisyonları','/sepet':'Listem','/odeme':'Ödeme','/odeme/iptal':'İşlem iptal edildi','/odeme/basarili':'İşlem durumu'};
  const categories = {lokum:'Lokum',soap:'Sabun',care:'Kişisel bakım',cream:'Kremler',essential:'Uçucu yağlar',honey:'Bal',pantry:'Pekmez ve mutfak',nuts:'Kuruyemiş',dates:'Hurma',salt:'Tuz',flour:'Un',form:'Form ürünleri',spice:'Baharat ve bitki',oil:'Yağlar'};
  if (pages[route]) { result.title = `${brand[pages[route][0]]} | Detoks.gr`; result.description = brand[pages[route][1]]; }
  else if (titles[route]) { result.title = `${titles[route]} | Detoks.gr`; result.description = route === '/shop' ? brand['hero.lead'] : 'Detoks Aktar. Gümülcine. Katalog önizlemesi, çevrim içi ödeme kapalı.'; }
  else if (route.startsWith('/shop/') && categories[route.split('/')[2]]) { result.title = `${categories[route.split('/')[2]]} | Detoks.gr`; result.description = `${categories[route.split('/')[2]]}. Taha’nın Gümülcine’deki aktarının seçkisini inceleyin, ürün ayrıntılarını sorun.`; }
  else if (route.startsWith('/p/')) {
    const index = slugs.indexOf(route.slice(3));
    const row = rows[index];
    if (row && row.editorial_status !== 'İNCELEME ÖNCESİ YAYIN YOK') {
      const name = sourceProductTitle(row);
      result.title = `${name} | Detoks.gr`;
      result.description = `${name}. Detoks Aktar katalog seçkisi. Ürün bilgileri, referans fiyat ve bilgi talebi.`;
      const scene = scenes.find(scene => scene.primaryFor.includes(row.source_record_id));
      if (scene) result.image = absolute((scene.variants.find(v=>v.width===1200) ?? scene.variants.at(-1)).src);
    }
  }
  return result;
}

export function applyPageMeta(html, meta) {
  const keys = new Set(['description','og:title','og:description','og:image','og:url','twitter:title','twitter:description','twitter:image','robots','googlebot']);
  let output = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'');
  output = output.replace(/<meta\b[^>]*>/gi, tag => {
    const name = tag.match(/(?:name|property)\s*=\s*["']([^"']+)["']/i)?.[1];
    return keys.has(name) ? '' : tag;
  }).replace(/<link\b[^>]*>/gi, tag => /rel\s*=\s*["']canonical["']/i.test(tag) ? '' : tag);
  const tags = `<title>${escape(meta.title)}</title>`
    + `<meta name="description" content="${escape(meta.description)}"/>`
    + `<meta name="robots" content="noindex,nofollow"/><meta name="googlebot" content="noindex,nofollow"/>`
    + `<link rel="canonical" href="${escape(meta.url)}"/>`
    + Object.entries({'og:title':meta.title,'og:description':meta.description,'og:image':meta.image,'og:url':meta.url}).map(([property,content])=>`<meta property="${property}" content="${escape(content)}"/>`).join('')
    + Object.entries({'twitter:title':meta.title,'twitter:description':meta.description,'twitter:image':meta.image}).map(([name,content])=>`<meta name="${name}" content="${escape(content)}"/>`).join('');
  return output.replace(/<\/head>/i, `${tags}</head>`);
}
