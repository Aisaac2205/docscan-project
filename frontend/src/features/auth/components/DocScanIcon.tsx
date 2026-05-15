import Image from 'next/image';

export function DocScanIcon({ dark }: { dark?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt="DocScan"
      width={28}
      height={28}
      className={dark ? undefined : 'invert'}
      priority
    />
  );
}
