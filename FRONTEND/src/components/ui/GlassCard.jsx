import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const GlassCard = ({ children, className, hoverEffect = true, ...props }) => {
  return (
    <div 
      className={cn(
        "glass-panel p-6",
        hoverEffect && "glass-card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
