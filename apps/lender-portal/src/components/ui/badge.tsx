import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-positive/10 text-positive border-positive/20',
        warning:
          'border-transparent bg-warning/10 text-warning border-warning/20',
        info: 'border-transparent bg-info/10 text-info border-info/20',
        error:
          'border-transparent bg-negative/10 text-negative border-negative/20',
        // Score badges
        scoreExcellent:
          'border-transparent bg-score-excellent/10 text-score-excellent font-mono',
        scoreGood:
          'border-transparent bg-score-good/10 text-score-good font-mono',
        scoreFair:
          'border-transparent bg-score-fair/10 text-score-fair font-mono',
        scorePoor:
          'border-transparent bg-score-poor/10 text-score-poor font-mono',
        scoreVeryPoor:
          'border-transparent bg-score-veryPoor/10 text-score-veryPoor font-mono',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Score-specific badge component
export interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

function ScoreBadge({ score, size = 'default', className }: ScoreBadgeProps) {
  const getVariant = (): BadgeProps['variant'] => {
    if (score >= 80) return 'scoreExcellent';
    if (score >= 70) return 'scoreGood';
    if (score >= 60) return 'scoreFair';
    if (score >= 50) return 'scorePoor';
    return 'scoreVeryPoor';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      variant={getVariant()}
      className={cn('font-mono', sizeClasses[size], className)}
    >
      {score}
    </Badge>
  );
}

export { Badge, badgeVariants, ScoreBadge };
