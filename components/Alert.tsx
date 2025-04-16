import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../utils/cn';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  title?: string;
  description?: string;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, description, children, ...props }, ref) => {
    const variants = {
      default: {
        bg: 'bg-blue-50',
        icon: 'text-blue-400',
        title: 'text-blue-800',
        description: 'text-blue-700',
        Icon: InformationCircleIcon,
      },
      destructive: {
        bg: 'bg-red-50',
        icon: 'text-red-400',
        title: 'text-red-800',
        description: 'text-red-700',
        Icon: XCircleIcon,
      },
      success: {
        bg: 'bg-green-50',
        icon: 'text-green-400',
        title: 'text-green-800',
        description: 'text-green-700',
        Icon: CheckCircleIcon,
      },
      warning: {
        bg: 'bg-yellow-50',
        icon: 'text-yellow-400',
        title: 'text-yellow-800',
        description: 'text-yellow-700',
        Icon: ExclamationCircleIcon,
      },
    };

    const { bg, icon, title: titleColor, description: descriptionColor, Icon } = variants[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md p-4',
          bg,
          className
        )}
        {...props}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', icon)} aria-hidden="true" />
          </div>
          <div className="ml-3">
            {title && (
              <h3 className={cn('text-sm font-medium', titleColor)}>
                {title}
              </h3>
            )}
            {description && (
              <div className={cn('mt-2 text-sm', descriptionColor)}>
                <p>{description}</p>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert }; 