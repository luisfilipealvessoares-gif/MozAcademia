import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there is a hash in the URL, it's likely an anchor link.
    // We don't scroll to top, allowing the browser or other components
    // to handle scrolling to the anchor.
    if (hash) {
      return;
    }

    // For any other navigation (pathname change), scroll to the top of the page.
    window.scrollTo(0, 0);
  }, [pathname]); // Reruns the effect when the path changes

  return null;
};

export default ScrollToTop;
