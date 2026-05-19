'use client';

import { useEffect, useState } from 'react';

/**
 * Devuelve `value` después de que el caller deje de cambiarlo durante
 * `delayMs`. Útil para inputs de búsqueda que disparan fetch.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}
