interface IconProps {
  className?: string;
  size?: number;
}

export function SpinnerIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CameraIcon({ className = '', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 17 17" fill="none" className={className}>
      <path d="M1 5.5C1 4.67 1.67 4 2.5 4h1.382l1-2h5.236l1 2H13.5C14.33 4 15 4.67 15 5.5v8c0 .83-.67 1.5-1.5 1.5h-11C1.67 15 1 14.33 1 13.5v-8z" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="8" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

export function CloseIcon({ className = '', size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function OcrIcon({ className = '', size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 10.5h5M10.5 8v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function PrintIcon({ className = '', size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" className={className}>
      <rect x="2" y="1" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 7v4h5V7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="9.5" cy="4" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function WifiIcon({ className = '', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 17 17" fill="none" className={className}>
      <path d="M1.5 6.5C3.7 4.3 6.4 3 8.5 3s4.8 1.3 7 3.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M4 9.5C5.5 8 6.9 7.2 8.5 7.2s3 .8 4.5 2.3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M6.5 12.5C7.2 11.8 7.8 11.5 8.5 11.5s1.3.3 2 1" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="8.5" cy="14.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function UsbIcon({ className = '', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 17 17" fill="none" className={className}>
      <path d="M8.5 2v10M5 8.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="6.5" y="12" width="4" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 4h1.5V2.5M11 4H9.5V2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5.5" y="3.5" width="2" height="1.5" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="9.5" y="3.5" width="2" height="1.5" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function BluetoothIcon({ className = '', size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 17 17" fill="none" className={className}>
      <path d="M5.5 5.5L11 11l-2.5 2.5V3L11 5.5 5.5 11" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ScanIcon({ className = '', size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <rect x="1" y="3" width="12" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1 5.5V2.5M13 5.5V2.5M1 8.5v3M13 8.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function FileIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M3 1h7l3 3v11H3V1z" stroke="#A8A29E" strokeWidth="1.3" />
      <path d="M10 1v3h3" stroke="#A8A29E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon({ className = '', size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M2 4h10M5 4V2h4v2M6 7v4M8 7v4M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DocsIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="2" y="1" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="5" y="3" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 7h4M7 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function PendingIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.5V8l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ScannerDeviceIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1" y="1" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1 5h14" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 11v4M8 11v4M11 11v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function PrinterIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="3" y="1" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 8H1.5A1.5 1.5 0 0 0 0 9.5v3A1.5 1.5 0 0 0 1.5 14H3M13 8h1.5A1.5 1.5 0 0 1 16 9.5v3A1.5 1.5 0 0 1 14.5 14H13" stroke="currentColor" strokeWidth="1.3" />
      <rect x="3" y="10" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12.5" cy="10.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function CheckIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M4 10l5 5 7-8" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UploadIcon({ active = false, className = '', size = 22 }: IconProps & { active?: boolean }) {
  const color = active ? '#2563EB' : '#A8A29E';
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={className}>
      <path d="M11 14V5M11 5L7 9M11 5l4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ImageIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1" y="1" width="14" height="14" rx="2" stroke="#A8A29E" strokeWidth="1.3" />
      <circle cx="5" cy="5" r="1.5" stroke="#A8A29E" strokeWidth="1.3" />
      <path d="M1 11l4-3 3 2.5 2-1.5 5 4" stroke="#A8A29E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PdfIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M3 1h7l3 3v11H3V1z" stroke="#A8A29E" strokeWidth="1.3" />
      <path d="M10 1v3h3" stroke="#A8A29E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8h6M5 10.5h4" stroke="#A8A29E" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function SaveIcon({ className = '', size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 1v4h6V1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="8" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function SparkleIcon({ className = '', size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M7 1v2.5M7 10.5V13M1 7h2.5M10.5 7H13M3.05 3.05l1.77 1.77M9.18 9.18l1.77 1.77M10.95 3.05 9.18 4.82M4.82 9.18 3.05 10.95" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function SendIcon({ className = '', size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M12 7L2 2l2.5 5L2 12l10-5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4.5 7h7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ChatIcon({ className = '', size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M1 2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4.5L1 13V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4 5h6M4 7.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className = '', size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EyeIcon({ className = '', size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function CopyIcon({ className = '', size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" className={className}>
      <rect x="4" y="4" width="8" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 9H1.5A.5.5 0 0 1 1 8.5v-7A.5.5 0 0 1 1.5 1h7a.5.5 0 0 1 .5.5V2"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function CheckSmallIcon({ className = '', size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" className={className}>
      <path d="M2.5 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
