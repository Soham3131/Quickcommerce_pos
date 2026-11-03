'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Reusable Global Route Scroll Handler
 *
 * Requirements (Phase 6.2):
 * - Resets main page scroll position to the top on page route changes.
 * - Works across Next.js App Router (Storefront, Categories, Products, Admin).
 * - Does NOT trigger or reset scroll on:
 *   - Modal openings
 *   - Quantity stepper changes
 *   - Add-to-cart interactions
 *   - Local filter changes
 * - Respects anchor links (e.g. #categories) and scrolls to targeted section.
 * - Properly handles internal scroll containers without disrupting independent POS panels.
 */
export function RouteScrollToTop() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Only execute when the route pathname actually changes
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;

      // Handle anchor navigation if present in URL
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash) {
          const targetElement = document.querySelector(hash);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }

        // Global window scroll reset
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

        // If main container has independent scroll (Admin ERP or Storefront main)
        const mainEl = document.querySelector('main');
        if (mainEl && !pathname.startsWith('/pos')) {
          mainEl.scrollTop = 0;
        }

        const appScroll = document.getElementById('app-scroll-container');
        if (appScroll) {
          appScroll.scrollTop = 0;
        }
      }
    }
  }, [pathname]);

  return null;
}
