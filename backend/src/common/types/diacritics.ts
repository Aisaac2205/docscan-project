// Regex de marcas diacríticas combinadoras (U+0300 a U+036F).
// Construido en runtime con String.fromCharCode para evitar issues de encoding
// de literales en el source (algunos editores normalizan diacríticos sueltos).
export const DIACRITICS_REGEX = new RegExp(
  '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']',
  'gu',
);
