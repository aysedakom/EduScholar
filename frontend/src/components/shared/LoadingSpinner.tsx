import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <div className="flex items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className={`${sizes[size]} animate-spin text-primary`} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}

