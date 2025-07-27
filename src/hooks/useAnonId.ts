import { useEffect, useState } from 'react';

export function useAnonId() {
  const [anonId, setAnonId] = useState<string | null>(null);

  useEffect(() => {
    let storedId = localStorage.getItem('anonId');
    if (!storedId) {
      storedId = `anon_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('anonId', storedId);
    }
    setAnonId(storedId);
  }, []);

  return anonId;
}
