'use client';

import { use } from 'react';
import { PersonDetailView } from '@/views/PersonDetailView/PersonDetailView';

interface Props {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: Props) {
  const { id } = use(params);
  return <PersonDetailView personId={id} />;
}
