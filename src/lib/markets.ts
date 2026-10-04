export type CountryCode =
  | "GR"
  | "DE"
  | "FR"
  | "IT"
  | "ES"
  | "NL"
  | "BE"
  | "AT"
  | "PL"
  | "SE"
  | "DK"
  | "FI"
  | "PT"
  | "IE"
  | "CZ"
  | "RO"
  | "HU"
  | "BG"
  | "HR"
  | "SK"
  | "SI"
  | "LT"
  | "LV"
  | "EE"
  | "LU"
  | "MT"
  | "CY"
  | "NO";

export type Currency = "EUR";

export const COUNTRIES: { code: CountryCode; name: string; currency: Currency }[] = [
  { code: "GR", name: "Yunanistan", currency: "EUR" },
  { code: "DE", name: "Almanya", currency: "EUR" },
  { code: "FR", name: "Fransa", currency: "EUR" },
  { code: "IT", name: "İtalya", currency: "EUR" },
  { code: "ES", name: "İspanya", currency: "EUR" },
  { code: "NL", name: "Hollanda", currency: "EUR" },
  { code: "BE", name: "Belçika", currency: "EUR" },
  { code: "AT", name: "Avusturya", currency: "EUR" },
  { code: "PL", name: "Polonya", currency: "EUR" },
  { code: "SE", name: "İsveç", currency: "EUR" },
  { code: "DK", name: "Danimarka", currency: "EUR" },
  { code: "FI", name: "Finlandiya", currency: "EUR" },
  { code: "PT", name: "Portekiz", currency: "EUR" },
  { code: "IE", name: "İrlanda", currency: "EUR" },
  { code: "CZ", name: "Çekya", currency: "EUR" },
  { code: "RO", name: "Romanya", currency: "EUR" },
  { code: "HU", name: "Macaristan", currency: "EUR" },
  { code: "BG", name: "Bulgaristan", currency: "EUR" },
  { code: "HR", name: "Hırvatistan", currency: "EUR" },
  { code: "SK", name: "Slovakya", currency: "EUR" },
  { code: "SI", name: "Slovenya", currency: "EUR" },
  { code: "LT", name: "Litvanya", currency: "EUR" },
  { code: "LV", name: "Letonya", currency: "EUR" },
  { code: "EE", name: "Estonya", currency: "EUR" },
  { code: "LU", name: "Lüksemburg", currency: "EUR" },
  { code: "MT", name: "Malta", currency: "EUR" },
  { code: "CY", name: "Kıbrıs", currency: "EUR" },
  { code: "NO", name: "Norveç", currency: "EUR" },
];

export function countryByCode(code: CountryCode) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}
