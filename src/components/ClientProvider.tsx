'use client';

import { createContext, useContext } from 'react';
import { useAnonId } from '@/hooks/useAnonId';

const AnonIdContext = createContext<string | null>(null);

export function useAnonIdContext() {
  return useContext(AnonIdContext);
}

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const anonId = useAnonId();

  if (!anonId) return null; // or a loader/spinner while anonId loads

  return (
    <AnonIdContext.Provider value={anonId}>
      {children}
    </AnonIdContext.Provider>
  );
}
