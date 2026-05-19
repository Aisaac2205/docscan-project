/**
 * Multer decodifica los filenames del header Content-Disposition usando
 * Latin-1 (ISO-8859-1) según la spec RFC 7578 §4.2.
 *
 * Sin embargo, los browsers modernos envían UTF-8. Esto causa que
 * caracteres como "ñ", "á", "ó" lleguen como mojibake
 * (e.g. "Impresión" → "Impresiön", "SARCEÑO" → "SARCEÃ'O").
 *
 * Esta función re-interpreta los bytes Latin-1 como UTF-8.
 * Si el string ya es UTF-8 válido (raro pero posible), lo devuelve tal cual.
 */
export function decodeMulterFilename(rawName: string): string {
  try {
    // Convertir cada char Latin-1 a su byte original
    const bytes = new Uint8Array(rawName.length);
    for (let i = 0; i < rawName.length; i++) {
      bytes[i] = rawName.charCodeAt(i);
    }

    // Re-decodificar los bytes como UTF-8
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);

    return decoded;
  } catch {
    // Si falla la decodificación UTF-8 (el string ya era Latin-1 real),
    // devolvemos el original — es lo mejor que podemos hacer.
    return rawName;
  }
}
