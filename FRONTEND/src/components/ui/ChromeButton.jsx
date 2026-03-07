import { cn } from './GlassCard';

export const ChromeButton = ({ children, className, ...props }) => {
  return (
    <button 
      className={cn("chrome-button", className)}
      {...props}
    >
      {children}
    </button>
  );
};
