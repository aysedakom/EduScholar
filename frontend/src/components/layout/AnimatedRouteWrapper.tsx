import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AnimatedRouteWrapperProps {
  children: React.ReactNode;
}

export const AnimatedRouteWrapper: React.FC<AnimatedRouteWrapperProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-forwards w-full">
      {children}
    </div>
  );
};
