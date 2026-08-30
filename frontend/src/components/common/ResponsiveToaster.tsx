import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';

export const ResponsiveToaster: React.FC = () => {
  const [position, setPosition] = useState<'top-right' | 'top-center'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'top-center' : 'top-right';
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPosition('top-center');
      } else {
        setPosition('top-right');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Toaster
      position={position}
      richColors
      closeButton
      expand={false}
      duration={6000}
      toastOptions={{
        className: 'rounded-2xl font-sans text-xs shadow-2xl border backdrop-blur-md',
        style: {
          maxWidth: '92vw',
        },
      }}
    />
  );
};
