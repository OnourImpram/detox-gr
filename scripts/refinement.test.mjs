import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {sanitizeCart,sanitizePersistedShop} from '../src/lib/cart-storage.ts';
import {parseDiscoverySearch} from '../src/lib/discovery.ts';
const optional=async p=>existsSync(new URL(p,import.meta.url))?import(p):{};
const quantity=await optional('../src/lib/list-quantity.ts');
const names=await optional('../src/lib/label-translation.ts');
const suggestions=await optional('../src/lib/search-suggestions.ts');
const known=new Set(['rose-lokum','vinegar']);const weight=new Set(['rose-lokum']);
test('quarter kilo survives restoration only for a known by-weight product',()=>assert.deepEqual(sanitizeCart([{slug:'rose-lokum',qty:.25},{slug:'vinegar',qty:.25}],known,weight),[{slug:'rose-lokum',qty:.25}]));
test('weight restoration still strips personal data',()=>assert.deepEqual(sanitizePersistedShop({country:'DE',cart:[{slug:'rose-lokum',qty:.5}],orders:[{email:'private'}],note:'private'},known,weight),{country:'DE',cart:[{slug:'rose-lokum',qty:.5}]}));
test('duplicate kilogram lines add without floating point drift',()=>assert.deepEqual(sanitizeCart([{slug:'rose-lokum',qty:.25},{slug:'rose-lokum',qty:.5}],known,weight),[{slug:'rose-lokum',qty:.75}]));
test('arbitrary fractional packets and malformed weights remain invalid',()=>assert.deepEqual(sanitizeCart([{slug:'vinegar',qty:1.5},{slug:'rose-lokum',qty:NaN},{slug:'rose-lokum',qty:.123},{slug:'rose-lokum',qty:-1}],known,weight),[]));
test('selection quantity rules distinguish kilograms from packets',()=>{assert.equal(typeof quantity.quantityRule,'function');assert.deepEqual(quantity.quantityRule('kg'),{min:.25,step:.25,max:20,initial:.25});assert.deepEqual(quantity.quantityRule('paket'),{min:1,step:1,max:20,initial:1});});
test('a quarter kilo at EUR 15.90 rounds to EUR 3.98, not a kilo or a zero price',()=>{assert.equal(typeof quantity.lineAmountCents,'function');assert.equal(quantity.lineAmountCents(15.90,.25),398);assert.equal(quantity.lineAmountCents(null,1),null);assert.equal(quantity.lineAmountCents(NaN,1),null);});
test('requested quantity is constrained without damaging valid quarters',()=>{assert.equal(typeof quantity.normalizeListQuantity,'function');assert.equal(quantity.normalizeListQuantity(.75,'kg'),.75);assert.equal(quantity.normalizeListQuantity(1.7,'paket'),1);assert.equal(quantity.normalizeListQuantity(Infinity,'kg'),.25);assert.equal(quantity.normalizeListQuantity(30,'kg'),20);});
test('search keeps the space needed for the next word while typing',()=>assert.equal(parseDiscoverySearch({q:'black '}).q,'black '));
test('whole-label translations ignore Turkish casing',()=>{assert.equal(typeof names.translateLabel,'function');assert.equal(names.translateLabel('KARANFİL',[['karanfil','Cloves']]),'Cloves');assert.equal(names.translateLabel('Kuru  İncir',[['kuru incir','Dried figs']]),'Dried figs');});
test('long complete product labels outrank partial terms',()=>{assert.equal(typeof names.translateLabel,'function');assert.equal(names.translateLabel('Lavanta YAĞI',[['yağı','oil'],['lavanta','lavender'],['lavanta yağı','Lavender oil']]),'Lavender oil');});
test('translation does not rewrite a substring inside a brand',()=>{assert.equal(typeof names.translateLabel,'function');assert.equal(names.translateLabel('Balsamic BRAND',[['bal','honey']]),'Balsamic BRAND');});
test('unknown text remains source text, never a fabricated product claim',()=>{assert.equal(typeof names.translateLabel,'function');assert.equal(names.translateLabel('New Brand 500 ml',[]),'New Brand 500 ml');});
test('empty search suggests nothing and fuzzy suggestions never silently change the query',()=>{assert.equal(typeof suggestions.suggestSearch,'function');assert.deepEqual(suggestions.suggestSearch('', ['Lavanta yağı']),[]);assert.deepEqual(suggestions.suggestSearch('zzzzzz', ['Lavanta yağı']),[]);});
test('mistyped lavnata receives a real catalogue term',()=>{assert.equal(typeof suggestions.suggestSearch,'function');assert.deepEqual(suggestions.suggestSearch('lavnata',['Lavanta yağı','Lavanta sabunu']),['Lavanta']);});

const contextNames=await optional('../src/lib/product-name-context.ts');
test('soap descriptions use scent vocabulary, never food flavouring',()=>{
 assert.equal(typeof contextNames.contextProductName,'function');
 assert.equal(contextNames.contextProductName('DT018','en'),'Loofah body soap, green apple scent');
 assert.equal(contextNames.contextProductName('DT018','el'),'Σαπούνι σώματος με λούφα, άρωμα πράσινου μήλου');
});
test('all nine scented loofah soaps have a complete title in all twenty languages',()=>{
 assert.equal(typeof contextNames.contextProductName,'function');
 for(const locale of ['tr','el','en','de','fr','it','es','nl','pl','no','bg','ro','sv','da','fi','pt','hu','cs','hr','sk'])for(let id=18;id<=26;id++)assert.ok(contextNames.contextProductName(`DT0${id}`,locale)?.trim());
 assert.equal(contextNames.contextProductName('DT999','en'),undefined);
});

const links=await optional('../src/lib/storefront-href.ts');
test('shared product URL includes the actual host and Pages base exactly once',()=>{
 assert.equal(typeof links.storefrontHref,'function');
 assert.equal(links.storefrontHref('https://onourimpram.github.io','/detox-gr/','/p/gul-lokumu?lang=el'),'https://onourimpram.github.io/detox-gr/p/gul-lokumu?lang=el');
 assert.equal(links.storefrontHref('https://onourimpram.github.io','/detox-gr/','/detox-gr/shop?lang=tr'),'https://onourimpram.github.io/detox-gr/shop?lang=tr');
});
test('shared URL helper supports a root domain without hardcoding the preview hostname',()=>{
 assert.equal(typeof links.storefrontHref,'function');
 assert.equal(links.storefrontHref('https://detoks.gr','/','/shop?lang=en'),'https://detoks.gr/shop?lang=en');
 assert.throws(()=>links.storefrontHref('https://detoks.gr','/','//external.example/'));
});

const commerce=await import('../src/lib/commerce-policy.ts');
test('quarter kilos are request amounts and never bypass integer checkout validation',()=>{
 assert.equal(quantity.validListQuantity(.25,'kg'),true);
 assert.equal(commerce.validateQuantity(.25),false);
 assert.ok(commerce.saleBlockers({publish:false,priceEur:15.9,klass:'food',grams:250},'GR',.25).includes('quantity'));
});
test('display spelling fixes preserve unknown names rather than guessing',()=>{
 assert.equal(contextNames.displaySourceLabel('DT199','Kacun'),'Kajun');
 assert.equal(contextNames.displaySourceLabel('DT108','Yabanmersini özü'),'Yaban mersini özü');
 assert.equal(contextNames.displaySourceLabel('DT999','Owner label'),'Owner label');
});
