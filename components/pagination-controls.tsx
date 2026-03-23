import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PaginationControlsProps = {
  from: number;
  to: number;
  total: number;
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export const PaginationControls = ({
  from,
  to,
  total,
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
}: PaginationControlsProps) => (
  <div className="flex items-center justify-between px-1">
    <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">
      {total === 0 ? 'No results' : `${from}–${to} of ${total}`}
    </p>
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        className="rounded-full"
        onClick={onPreviousPage}
        disabled={!canPreviousPage}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xs font-bold uppercase tracking-widest text-foreground/40 tabular-nums">
        {pageIndex + 1} / {pageCount}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        className="rounded-full"
        onClick={onNextPage}
        disabled={!canNextPage}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
