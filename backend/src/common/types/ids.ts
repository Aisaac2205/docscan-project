// Branded primitives — previenen mezclar IDs de distintos dominios at compile time.
// Patrón estándar (typescript-expert SKILL): nominal typing sobre string.
//
// Uso:
//   import { PersonId, DocumentId, asPersonId } from '../../common/types/ids';
//   function link(documentId: DocumentId, personId: PersonId) { ... }
//
// El brand vive solo en el sistema de tipos — en runtime sigue siendo string,
// sin overhead. Para construirlos desde strings sin tipo (params HTTP, FK Prisma)
// usar las funciones `as*` que sirven de checkpoint explícito.

type Brand<K, T> = K & { readonly __brand: T };

export type PersonId   = Brand<string, 'PersonId'>;
export type DocumentId = Brand<string, 'DocumentId'>;
export type UserId     = Brand<string, 'UserId'>;

export const asPersonId   = (raw: string): PersonId   => raw as PersonId;
export const asDocumentId = (raw: string): DocumentId => raw as DocumentId;
export const asUserId     = (raw: string): UserId     => raw as UserId;
