/**
 * Script de migración: corrige filenames con mojibake (Latin-1 → UTF-8).
 *
 * Multer decodificaba los nombres de archivo como Latin-1 antes del fix.
 * Este script recorre todos los documentos y re-decodifica los que tienen
 * caracteres rotos (ej. "Impresiön" → "Impresión", "SARCEÃ'O" → "SARCEÑO").
 *
 * Uso:
 *   npx ts-node scripts/fix-filename-encoding.ts
 *
 * Seguro de ejecutar múltiples veces — solo actualiza registros que cambien.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Re-interpreta bytes Latin-1 como UTF-8.
 * Idéntica a la utility en src/common/utils/decode-filename.ts
 */
function decodeFromLatin1(raw: string): string {
  try {
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i);
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return raw;
  }
}

async function main(): Promise<void> {
  const documents = await prisma.document.findMany({
    select: { id: true, originalName: true },
  });

  console.log(`📄 Total de documentos: ${documents.length}`);

  let fixed = 0;
  let skipped = 0;
  const errors: Array<{ id: string; name: string; error: string }> = [];

  for (const doc of documents) {
    const decoded = decodeFromLatin1(doc.originalName);

    // Si la decodificación no cambió nada, saltar
    if (decoded === doc.originalName) {
      skipped++;
      continue;
    }

    try {
      await prisma.document.update({
        where: { id: doc.id },
        data: { originalName: decoded },
      });
      console.log(`  ✅ "${doc.originalName}" → "${decoded}"`);
      fixed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ id: doc.id, name: doc.originalName, error: msg });
      console.error(`  ❌ Error actualizando ${doc.id}: ${msg}`);
    }
  }

  console.log('\n📊 Resultado:');
  console.log(`  Corregidos: ${fixed}`);
  console.log(`  Sin cambios: ${skipped}`);
  if (errors.length > 0) {
    console.log(`  Errores: ${errors.length}`);
  }
}

main()
  .catch((e) => {
    console.error('💥 Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
