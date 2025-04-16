import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-white shadow-sm',
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="p-6">
            {title && (
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-2 text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="p-6 pt-0">
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card }; 