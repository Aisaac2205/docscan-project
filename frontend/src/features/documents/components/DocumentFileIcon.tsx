import Image from 'next/image';
import pdfIcon from '@/shared/assets/PDF_file_icon.svg.png';
import docxIcon from '@/shared/assets/docx_icon.svg.png';
import { cn } from '@/shared/lib/cn';

type FileKind = 'pdf' | 'docx' | 'image' | 'other';

interface DocumentFileIconProps {
  /** mime type tal como viene del backend (ej: application/pdf). */
  mimeType?: string | null;
  /** nombre original del archivo — fallback para detectar la extensión. */
  fileName?: string | null;
  /** Cuando es imagen, URL del archivo para mostrar como mini-preview. */
  imageUrl?: string | null;
  /** Tamaño en píxeles. Default 20. */
  size?: number;
  className?: string;
}

/**
 * Decide el ícono visual según mime/extensión:
 *   - PDF → PDF_file_icon.svg.png
 *   - DOC/DOCX → docx_icon.svg.png
 *   - Imágenes → mini-preview del propio archivo desde el CDN
 *   - Otros → fallback al PNG de PDF (caso menos frecuente)
 */
export function DocumentFileIcon({
  mimeType,
  fileName,
  imageUrl,
  size = 20,
  className,
}: DocumentFileIconProps) {
  const kind = resolveKind(mimeType, fileName);

  if (kind === 'image' && imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        width={size}
        height={size}
        className={cn('rounded-sm object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  const src = kind === 'docx' ? docxIcon : pdfIcon;
  const alt = kind === 'docx' ? 'Documento Word' : 'Documento PDF';

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('object-contain', className)}
      style={{ width: size, height: size }}
    />
  );
}

function resolveKind(mimeType?: string | null, fileName?: string | null): FileKind {
  const mime = (mimeType ?? '').toLowerCase();
  const name = (fileName ?? '').toLowerCase();

  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';

  if (
    mime === 'application/msword' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx') ||
    name.endsWith('.doc')
  ) {
    return 'docx';
  }

  if (mime.startsWith('image/') || /\.(webp|jpe?g|png|gif|avif)$/i.test(name)) {
    return 'image';
  }

  return 'other';
}
