
import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768) {
  // Initialize state; handle SSR safely by checking if window exists
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    // Update state when the media query status changes
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    // Initial check in case it changed between initialization and mounting
    setIsMobile(mediaQuery.matches);

    // Clean up listener on component unmount
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint]);

  return isMobile;
}
