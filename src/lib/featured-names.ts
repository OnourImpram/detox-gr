import type { Locale } from './i18n-locales.ts';

export const FEATURED_NAME_IDS = ['DT117','DT101','DT157','DT002','DT001','DT021','DT049','DT096'] as const;
/** Whole product titles keyed by source ID, not word-by-word substitution. Owner-approved names take precedence. */
export const FEATURED_NAMES: Record<Locale, readonly string[]> = {
  tr: ['Elma sirkesi','Üzüm pekmezi','Tarhana','Gül lokumu','Kiraz ve vişneli lokum','Kabak lifli vücut sabunu, lavanta aromalı','Gül suyu','Çam ve püren balı'],
  el: ['Ξίδι μήλου','Πετιμέζι σταφυλιού','Τραχανάς','Λουκούμι τριαντάφυλλο','Λουκούμι κεράσι και βύσσινο','Σαπούνι σώματος με λούφα, άρωμα λεβάντας','Ροδόνερο','Μέλι πεύκου και ερείκης'],
  en: ['Apple vinegar','Grape molasses','Tarhana','Rose lokum','Cherry and sour cherry lokum','Loofah body soap, lavender scented','Rose water','Pine and heather honey'],
  de: ['Apfelessig','Traubenmelasse','Tarhana','Rosenlokum','Lokum mit Kirsche und Sauerkirsche','Luffa-Körperseife mit Lavendelduft','Rosenwasser','Kiefern- und Heidehonig'],
  fr: ['Vinaigre de pomme','Mélasse de raisin','Tarhana','Loukoum à la rose','Loukoum à la cerise et à la griotte','Savon pour le corps au luffa, parfum lavande','Eau de rose','Miel de pin et de bruyère'],
  it: ['Aceto di mele','Melassa d’uva','Tarhana','Lokum alla rosa','Lokum alla ciliegia e all’amarena','Sapone per il corpo con luffa, profumo di lavanda','Acqua di rose','Miele di pino ed erica'],
  es: ['Vinagre de manzana','Melaza de uva','Tarhana','Lokum de rosa','Lokum de cereza y guinda','Jabón corporal con lufa, aroma de lavanda','Agua de rosas','Miel de pino y brezo'],
  nl: ['Appelazijn','Druivenmelasse','Tarhana','Rozenlokum','Lokum met kers en zure kers','Luffa lichaamszeep met lavendelgeur','Rozenwater','Dennen- en heidehoning'],
  pl: ['Ocet jabłkowy','Melasa winogronowa','Tarhana','Lokum różane','Lokum z czereśnią i wiśnią','Mydło do ciała z luffą o zapachu lawendy','Woda różana','Miód sosnowy i wrzosowy'],
  no: ['Epleeddik','Druemelasse','Tarhana','Lokum med rose','Lokum med kirsebær og surkirsebær','Kroppssåpe med luffa og lavendelduft','Rosevann','Furu- og lynghonning'],
  bg: ['Ябълков оцет','Гроздов петмез','Трахана','Локум с роза','Локум с череша и вишна','Сапун за тяло с луфа, аромат на лавандула','Розова вода','Боров и пиренов мед'],
  ro: ['Oțet de mere','Melasă de struguri','Tarhana','Rahat cu trandafiri','Rahat cu cireșe și vișine','Săpun de corp cu lufă, parfum de lavandă','Apă de trandafiri','Miere de pin și de iarbă-neagră'],
  sv: ['Äppelvinäger','Druvmelass','Tarhana','Lokum med ros','Lokum med körsbär och surkörsbär','Kroppstvål med luffa och lavendeldoft','Rosenvatten','Tall- och ljunghonung'],
  da: ['Æbleeddike','Druemelasse','Tarhana','Lokum med rose','Lokum med kirsebær og surkirsebær','Kropssæbe med luffa og lavendelduft','Rosenvand','Fyrre- og lynghonning'],
  fi: ['Omenaviinietikka','Rypälemelassi','Tarhana','Ruusulokum','Kirsikka- ja hapankirsikkalokum','Vartalosaippua luffalla, laventelin tuoksu','Ruusuvesi','Mänty- ja kanervahunaja'],
  pt: ['Vinagre de maçã','Melaço de uva','Tarhana','Lokum de rosa','Lokum de cereja e ginja','Sabonete corporal com lufa, aroma de lavanda','Água de rosas','Mel de pinheiro e urze'],
  hu: ['Almaecet','Szőlőmelasz','Tarhana','Rózsás lokum','Cseresznyés és meggyes lokum','Luffás testszappan levendulaillattal','Rózsavíz','Fenyő- és hangaméz'],
  cs: ['Jablečný ocet','Hroznová melasa','Tarhana','Růžový lokum','Lokum s třešní a višní','Tělové mýdlo s lufou a vůní levandule','Růžová voda','Borovicový a vřesový med'],
  hr: ['Jabučni ocat','Melasa od grožđa','Tarhana','Lokum s ružom','Lokum s trešnjom i višnjom','Sapun za tijelo s lufom, miris lavande','Ružina vodica','Med od bora i vrijeska'],
  sk: ['Jablčný ocot','Hroznová melasa','Tarhana','Ružový lokum','Lokum s čerešňou a višňou','Telové mydlo s lufou a vôňou levandule','Ružová voda','Borovicový a vresový med'],
};
export function featuredName(sourceId: string, locale: Locale): string | undefined {
  const index = (FEATURED_NAME_IDS as readonly string[]).indexOf(sourceId);
  return index < 0 ? undefined : FEATURED_NAMES[locale][index];
}
