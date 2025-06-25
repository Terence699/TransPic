'use client';

import { useEffect, useState } from 'react';

/**
 * HydrationProvider helps prevent hydration mismatches caused by browser extensions
 * or other client-side modifications to the DOM.
 */
export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after the first render
    setIsHydrated(true);
  }, []);

  // During SSR and initial hydration, render a minimal version
  if (!isHydrated) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  // After hydration, render normally
  return <>{children}</>;
}
