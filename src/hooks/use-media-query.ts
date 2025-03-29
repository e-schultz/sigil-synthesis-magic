
import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design that returns whether a media query matches
 * 
 * @param query - CSS media query string (e.g. '(max-width: 768px)')
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query
    const mediaQuery = window.matchMedia(query);
    
    // Set initial match
    setMatches(mediaQuery.matches);

    // Handler for media query changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Subscribe to changes
    mediaQuery.addEventListener('change', handler);
    
    // Cleanup on unmount
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}
