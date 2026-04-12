import { LucideIcon } from 'lucide-react';
import { Button } from './button-sd';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 p-4 rounded-base bg-secondary-background border-2 border-border shadow-shadow">
          <Icon className="w-8 h-8 text-foreground" />
        </div>
      )}
      <h3 className="text-xl font-heading text-foreground mb-2">{title}</h3>
      <p className="text-foreground/60 mb-6 max-w-md font-base">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
