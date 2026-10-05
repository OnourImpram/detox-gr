import type { Locale } from './i18n-locales.ts';

/** Product-scoped copy prevents the food dictionary from describing soap as flavoured. */
const SOAP_NAMES: Readonly<Record<Locale, readonly string[]>> = {
  "tr": [
    "Kabak lifli vücut sabunu, yeşil elma kokulu",
    "Kabak lifli vücut sabunu, okyanus kokulu",
    "Kabak lifli vücut sabunu, zambak kokulu",
    "Kabak lifli vücut sabunu, lavanta kokulu",
    "Kabak lifli vücut sabunu, kavun kokulu",
    "Kabak lifli vücut sabunu, çuha çiçeği kokulu",
    "Kabak lifli vücut sabunu, nar kokulu",
    "Kabak lifli vücut sabunu, ahududu kokulu",
    "Kabak lifli vücut sabunu, Hindistan cevizi kokulu"
  ],
  "el": [
    "Σαπούνι σώματος με λούφα, άρωμα πράσινου μήλου",
    "Σαπούνι σώματος με λούφα, άρωμα ωκεανού",
    "Σαπούνι σώματος με λούφα, άρωμα κρίνου",
    "Σαπούνι σώματος με λούφα, άρωμα λεβάντας",
    "Σαπούνι σώματος με λούφα, άρωμα πεπονιού",
    "Σαπούνι σώματος με λούφα, άρωμα πρίμουλας",
    "Σαπούνι σώματος με λούφα, άρωμα ροδιού",
    "Σαπούνι σώματος με λούφα, άρωμα σμέουρου",
    "Σαπούνι σώματος με λούφα, άρωμα καρύδας"
  ],
  "en": [
    "Loofah body soap, green apple scent",
    "Loofah body soap, ocean scent",
    "Loofah body soap, lily scent",
    "Loofah body soap, lavender scent",
    "Loofah body soap, melon scent",
    "Loofah body soap, primrose scent",
    "Loofah body soap, pomegranate scent",
    "Loofah body soap, raspberry scent",
    "Loofah body soap, coconut scent"
  ],
  "de": [
    "Luffa-Körperseife mit Grünapfelduft",
    "Luffa-Körperseife mit Meeresduft",
    "Luffa-Körperseife mit Lilienduft",
    "Luffa-Körperseife mit Lavendelduft",
    "Luffa-Körperseife mit Melonenduft",
    "Luffa-Körperseife mit Primelduft",
    "Luffa-Körperseife mit Granatapfelduft",
    "Luffa-Körperseife mit Himbeerduft",
    "Luffa-Körperseife mit Kokosduft"
  ],
  "fr": [
    "Savon pour le corps au luffa, parfum pomme verte",
    "Savon pour le corps au luffa, parfum océan",
    "Savon pour le corps au luffa, parfum lys",
    "Savon pour le corps au luffa, parfum lavande",
    "Savon pour le corps au luffa, parfum melon",
    "Savon pour le corps au luffa, parfum primevère",
    "Savon pour le corps au luffa, parfum grenade",
    "Savon pour le corps au luffa, parfum framboise",
    "Savon pour le corps au luffa, parfum noix de coco"
  ],
  "it": [
    "Sapone corpo con luffa, profumo di mela verde",
    "Sapone corpo con luffa, profumo di oceano",
    "Sapone corpo con luffa, profumo di giglio",
    "Sapone corpo con luffa, profumo di lavanda",
    "Sapone corpo con luffa, profumo di melone",
    "Sapone corpo con luffa, profumo di primula",
    "Sapone corpo con luffa, profumo di melagrana",
    "Sapone corpo con luffa, profumo di lampone",
    "Sapone corpo con luffa, profumo di cocco"
  ],
  "es": [
    "Jabón corporal con lufa, aroma de manzana verde",
    "Jabón corporal con lufa, aroma marino",
    "Jabón corporal con lufa, aroma de lirio",
    "Jabón corporal con lufa, aroma de lavanda",
    "Jabón corporal con lufa, aroma de melón",
    "Jabón corporal con lufa, aroma de prímula",
    "Jabón corporal con lufa, aroma de granada",
    "Jabón corporal con lufa, aroma de frambuesa",
    "Jabón corporal con lufa, aroma de coco"
  ],
  "nl": [
    "Luffa lichaamszeep met groene-appelgeur",
    "Luffa lichaamszeep met oceaangeur",
    "Luffa lichaamszeep met leliegeur",
    "Luffa lichaamszeep met lavendelgeur",
    "Luffa lichaamszeep met meloengeur",
    "Luffa lichaamszeep met sleutelbloemgeur",
    "Luffa lichaamszeep met granaatappelgeur",
    "Luffa lichaamszeep met frambozengeur",
    "Luffa lichaamszeep met kokosgeur"
  ],
  "pl": [
    "Mydło do ciała z luffą o zapachu zielonego jabłka",
    "Mydło do ciała z luffą o zapachu oceanu",
    "Mydło do ciała z luffą o zapachu lilii",
    "Mydło do ciała z luffą o zapachu lawendy",
    "Mydło do ciała z luffą o zapachu melona",
    "Mydło do ciała z luffą o zapachu pierwiosnka",
    "Mydło do ciała z luffą o zapachu granatu",
    "Mydło do ciała z luffą o zapachu maliny",
    "Mydło do ciała z luffą o zapachu kokosa"
  ],
  "no": [
    "Kroppssåpe med luffa, grønn epleduft",
    "Kroppssåpe med luffa, havduft",
    "Kroppssåpe med luffa, liljeduft",
    "Kroppssåpe med luffa, lavendelduft",
    "Kroppssåpe med luffa, melonduft",
    "Kroppssåpe med luffa, primuladuft",
    "Kroppssåpe med luffa, granatepleduft",
    "Kroppssåpe med luffa, bringebærduft",
    "Kroppssåpe med luffa, kokosduft"
  ],
  "bg": [
    "Сапун за тяло с луфа, аромат на зелена ябълка",
    "Сапун за тяло с луфа, аромат на океан",
    "Сапун за тяло с луфа, аромат на лилия",
    "Сапун за тяло с луфа, аромат на лавандула",
    "Сапун за тяло с луфа, аромат на пъпеш",
    "Сапун за тяло с луфа, аромат на иглика",
    "Сапун за тяло с луфа, аромат на нар",
    "Сапун за тяло с луфа, аромат на малина",
    "Сапун за тяло с луфа, аромат на кокос"
  ],
  "ro": [
    "Săpun de corp cu lufă, parfum de măr verde",
    "Săpun de corp cu lufă, parfum de ocean",
    "Săpun de corp cu lufă, parfum de crin",
    "Săpun de corp cu lufă, parfum de lavandă",
    "Săpun de corp cu lufă, parfum de pepene galben",
    "Săpun de corp cu lufă, parfum de primulă",
    "Săpun de corp cu lufă, parfum de rodie",
    "Săpun de corp cu lufă, parfum de zmeură",
    "Săpun de corp cu lufă, parfum de cocos"
  ],
  "sv": [
    "Kroppstvål med luffa och grön äppeldoft",
    "Kroppstvål med luffa och havsdoft",
    "Kroppstvål med luffa och liljedoft",
    "Kroppstvål med luffa och lavendeldoft",
    "Kroppstvål med luffa och melondoft",
    "Kroppstvål med luffa och primuladoft",
    "Kroppstvål med luffa och granatäppeldoft",
    "Kroppstvål med luffa och hallondoft",
    "Kroppstvål med luffa och kokosdoft"
  ],
  "da": [
    "Kropssæbe med luffa og grøn æbleduft",
    "Kropssæbe med luffa og havduft",
    "Kropssæbe med luffa og liljeduft",
    "Kropssæbe med luffa og lavendelduft",
    "Kropssæbe med luffa og melonduft",
    "Kropssæbe med luffa og primuladuft",
    "Kropssæbe med luffa og granatæbleduft",
    "Kropssæbe med luffa og hindbærduft",
    "Kropssæbe med luffa og kokosduft"
  ],
  "fi": [
    "Luffa-vartalosaippua, vihreän omenan tuoksu",
    "Luffa-vartalosaippua, merellinen tuoksu",
    "Luffa-vartalosaippua, liljan tuoksu",
    "Luffa-vartalosaippua, laventelin tuoksu",
    "Luffa-vartalosaippua, melonin tuoksu",
    "Luffa-vartalosaippua, esikon tuoksu",
    "Luffa-vartalosaippua, granaattiomenan tuoksu",
    "Luffa-vartalosaippua, vadelman tuoksu",
    "Luffa-vartalosaippua, kookoksen tuoksu"
  ],
  "pt": [
    "Sabonete corporal com lufa, aroma de maçã verde",
    "Sabonete corporal com lufa, aroma marinho",
    "Sabonete corporal com lufa, aroma de lírio",
    "Sabonete corporal com lufa, aroma de lavanda",
    "Sabonete corporal com lufa, aroma de melão",
    "Sabonete corporal com lufa, aroma de prímula",
    "Sabonete corporal com lufa, aroma de romã",
    "Sabonete corporal com lufa, aroma de framboesa",
    "Sabonete corporal com lufa, aroma de coco"
  ],
  "hu": [
    "Luffás testszappan, zöldalma-illattal",
    "Luffás testszappan, óceánillattal",
    "Luffás testszappan, liliomillattal",
    "Luffás testszappan, levendulaillattal",
    "Luffás testszappan, sárgadinnye-illattal",
    "Luffás testszappan, kankalinillattal",
    "Luffás testszappan, gránátalma-illattal",
    "Luffás testszappan, málnaillattal",
    "Luffás testszappan, kókuszillattal"
  ],
  "cs": [
    "Tělové mýdlo s lufou, vůně zeleného jablka",
    "Tělové mýdlo s lufou, vůně oceánu",
    "Tělové mýdlo s lufou, vůně lilie",
    "Tělové mýdlo s lufou, vůně levandule",
    "Tělové mýdlo s lufou, vůně melounu",
    "Tělové mýdlo s lufou, vůně prvosenky",
    "Tělové mýdlo s lufou, vůně granátového jablka",
    "Tělové mýdlo s lufou, vůně malin",
    "Tělové mýdlo s lufou, vůně kokosu"
  ],
  "hr": [
    "Sapun za tijelo s lufom, miris zelene jabuke",
    "Sapun za tijelo s lufom, miris oceana",
    "Sapun za tijelo s lufom, miris ljiljana",
    "Sapun za tijelo s lufom, miris lavande",
    "Sapun za tijelo s lufom, miris dinje",
    "Sapun za tijelo s lufom, miris jaglaca",
    "Sapun za tijelo s lufom, miris nara",
    "Sapun za tijelo s lufom, miris maline",
    "Sapun za tijelo s lufom, miris kokosa"
  ],
  "sk": [
    "Telové mydlo s lufou, vôňa zeleného jablka",
    "Telové mydlo s lufou, vôňa oceánu",
    "Telové mydlo s lufou, vôňa ľalie",
    "Telové mydlo s lufou, vôňa levandule",
    "Telové mydlo s lufou, vôňa melóna",
    "Telové mydlo s lufou, vôňa prvosienky",
    "Telové mydlo s lufou, vôňa granátového jablka",
    "Telové mydlo s lufou, vôňa malín",
    "Telové mydlo s lufou, vôňa kokosu"
  ]
};

export function contextProductName(sourceId: string, locale: Locale): string | undefined {
 const match = /^DT0(1[89]|2[0-6])$/.exec(sourceId);
 return match ? SOAP_NAMES[locale][Number(match[1])-18] : undefined;
}

/** Spelling-only corrections. Original source IDs and URLs remain unchanged. */
const SPELLING: Readonly<Record<string, string>> = {
 DT053: 'Aloe vera jel', DT108: 'Yaban mersini özü', DT135: 'Goji berry',
 DT185: 'Deve dikeni yağı', DT199: 'Kajun', DT258: 'Hatmi çiçeği',
 DT159: 'Acve hurma', DT160: 'Safavi hurma', DT161: 'Sugay hurma', DT162: 'Mebrum hurma', DT163: 'Hudri hurma',
};
export function displaySourceLabel(sourceId: string, fallback: string) { return SPELLING[sourceId] ?? fallback; }
