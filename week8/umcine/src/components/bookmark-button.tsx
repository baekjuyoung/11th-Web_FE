
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getFavoriteStatus } from "../api/favorites/get-favorite-status";
import { createFavorite } from "../api/favorites/create-favorite";
import { deleteFavorite } from "../api/favorites/delete-favorite";
import { useAuthStore } from "../stores/auth-store";
import { cn } from "../utils/cn";

interface BookmarkButtonProps {
  movieId: number;
}

export function BookmarkButton({ movieId }: BookmarkButtonProps) {
  const queryClient = useQueryClient();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  // 백엔드에서 즐겨찾기 여부 조회
  const favoriteStatusQuery = useQuery({
    queryKey: ["favorites", "status", movieId],
    queryFn: () => getFavoriteStatus(movieId),
    enabled: Boolean(accessToken),
    retry: false,
  });

  const isBookmarked = favoriteStatusQuery.data ?? false;

  // 즐겨찾기 등록
  const createFavoriteMutation = useMutation({
    mutationFn: () => createFavorite(movieId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["favorites"],
      });
    },
  });

  // 즐겨찾기 해제
  const deleteFavoriteMutation = useMutation({
    mutationFn: () => deleteFavorite(movieId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["favorites"],
      });
    },
  });

  const isUpdating =
    createFavoriteMutation.isPending ||
    deleteFavoriteMutation.isPending;

  const handleToggleBookmark = () => {
    if (!accessToken) {
      alert("로그인 후 즐겨찾기를 이용할 수 있어요.");
      return;
    }

    if (
      isUpdating ||
      favoriteStatusQuery.isPending ||
      favoriteStatusQuery.isError
    ) {
      return;
    }

    if (isBookmarked) {
      deleteFavoriteMutation.mutate();
    } else {
      createFavoriteMutation.mutate();
    }
  };

  return (
    <button
      type="button"
      disabled={
        isUpdating ||
        (Boolean(accessToken) &&
          (favoriteStatusQuery.isPending ||
            favoriteStatusQuery.isError))
      }
      className={cn(
        "absolute top-[6px] right-[6px] flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-[4px] border p-[5px] disabled:cursor-not-allowed disabled:opacity-60",
        isBookmarked
          ? "border-blue-600 bg-blue-600"
          : "border-white/80 bg-[rgba(20,20,20,0.75)]"
      )}
      onClick={handleToggleBookmark}
      aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
      title={
        favoriteStatusQuery.isError
          ? "즐겨찾기 상태를 불러오지 못했어요."
          : undefined
      }
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
