import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: LucideIcon;
  label: string;
  href?: string;
}

const TrustBadge = React.forwardRef<HTMLSpanElement, TrustBadgeProps>(
  ({ icon: Icon, label, href, className, ...props }, ref) => {
    const inner = (
      <>
        <Icon
          className="h-5 w-5 shrink-0 text-[#FFB800]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span className="text-[#111111]">{label}</span>
      </>
    );

    const classes = cn(
      'inline-flex items-center gap-2 text-sm font-medium leading-none',
      className
    );

    if (href) {
      return (
        <a
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(classes, 'hover:opacity-80 transition-opacity')}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {inner}
        </a>
      );
    }

    return (
      <span ref={ref} className={classes} {...props}>
        {inner}
      </span>
    );
  }
);
TrustBadge.displayName = 'TrustBadge';

export { TrustBadge };
export type { TrustBadgeProps };
