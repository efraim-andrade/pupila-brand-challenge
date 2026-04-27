import { Folder, MessageCircle } from 'lucide-react';
import type { JSX } from 'react';
import { Badge } from '@/shared/ui/Badge';

interface CardContentProps {
  name: string;
  subtitle?: string;
  commentCount: number;
  group?: { name: string };
  tags: Array<{ id: string; name: string; color?: string }>;
}

export function CardContent({
  name,
  subtitle,
  commentCount,
  group,
  tags,
}: CardContentProps): JSX.Element {
  return (
    <div className="p-3">
      <p className="truncate text-sm font-medium text-text-primary">{name}</p>
      {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {commentCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-text-muted">
            <MessageCircle className="h-3 w-3" />
            {commentCount}
          </span>
        )}
        {group && (
          <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-text-tertiary shadow-border">
            <Folder className="h-2.5 w-2.5" />
            {group.name}
          </span>
        )}
        {tags.map((tag) => (
          <Badge key={tag.id} color={tag.color}>
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
