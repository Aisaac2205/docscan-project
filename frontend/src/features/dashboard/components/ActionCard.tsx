'use client';

import { useRouter } from 'next/navigation';
import { Heading } from '@/shared/components/Layout';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
}

export function ActionCard({ icon, title, description, href, onClick }: ActionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-start gap-4 p-4 md:p-5 bg-surface-card border border-border rounded-lg text-left hover:border-border-strong hover:shadow-sm transition-all card-interactive"
    >
      <div className="w-10 h-10 md:w-11 md:h-11 rounded-md bg-surface-sunken flex items-center justify-center flex-shrink-0 text-fg-secondary">
        {icon}
      </div>
      <div className="min-w-0">
        <Heading level={4} as="h3" className="text-fg-primary">{title}</Heading>
        <p className="text-caption text-fg-tertiary mt-0.5">{description}</p>
      </div>
    </button>
  );
}
