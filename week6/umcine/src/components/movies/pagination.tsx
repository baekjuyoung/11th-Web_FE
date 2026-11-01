import { cn } from "../../utils/cn";

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  onPageChange,
}: PaginationProps) {
  const pages = [1, 2, 3, 4, 5];

  return (
    <div className="mt-7 flex items-center justify-center gap-2">
      <button
        type="button"
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[5px] border-0 bg-transparent"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        ‹
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={cn(
            "h-7 w-7 cursor-pointer rounded-[5px] border-0 bg-transparent",
            currentPage === page && "bg-[#111827] text-white",
          )}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[5px] border-0 bg-transparent"
        onClick={() => onPageChange(Math.min(5, currentPage + 1))}
        disabled={currentPage === 5}
      >
        ›
      </button>
    </div>
  );
}