'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PresenterDetailPage from '@/components/PresenterDetailPage';

export default function Page() {
  const params = useParams();
  const presenterId = params.id;
  
  return <PresenterDetailPage presenterId={presenterId} />;
}