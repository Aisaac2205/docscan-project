'use client';

import { useRouter } from 'next/navigation';

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
      className="flex items-start gap-4 p-4 md:p-5 bg-white border border-stone-200 rounded-xl text-left hover:border-stone-300 hover:shadow-md transition-all card-interactive"
    >
      <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0 text-stone-700">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm md:text-base font-semibold text-stone-800">{title}</h3>
        <p className="text-xs md:text-sm text-stone-400 mt-0.5">{description}</p>
      </div>
    </button>
  );
}
