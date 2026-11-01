import { useBookmarkStore } from "../stores/bookmark-store";
import { cn } from "../utils/cn";

interface BookmarkButtonProps {
  movieId: number;
}

export function BookmarkButton({ movieId }: BookmarkButtonProps) {
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(movieId),
  );
  const toggleBookmark = useBookmarkStore(
    (state) => state.toggleBookmark,
  );

  return (
    <button
      type="button"
      className={cn(
        "absolute top-[6px] right-[6px] flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-[4px] border p-[5px]",
        isBookmarked
          ? "border-blue-600 bg-blue-600"
          : "border-white/80 bg-[rgba(20,20,20,0.75)]",
      )}
      onClick={() => toggleBookmark(movieId)}
      aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
    >
      <img
        className="block h-4 w-4 brightness-0 invert"
        src={
          isBookmarked
            ? "/icons/bookmark.svg"
            : "/icons/bookmark-outline.svg"
        }
        alt=""
      />
    </button>
  );
}