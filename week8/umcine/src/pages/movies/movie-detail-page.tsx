
import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { movieQueries } from "../../api/movies/movie-queries";
import { getFavoriteStatus } from "../../api/favorites/get-favorite-status";
import { createFavorite } from "../../api/favorites/create-favorite";
import { deleteFavorite } from "../../api/favorites/delete-favorite";
import { createRating } from "../../api/ratings/create-rating";
import { getMemberRatings } from "../../api/ratings/get-member-ratings";
import { getMemberId } from "../../utils/auth/get-member-id";
import { updateRating } from "../../api/ratings/update-rating";
import { deleteRating } from "../../api/ratings/delete-rating";
import { useAuthStore } from "../../stores/auth-store";
import { cn } from "../../utils/cn";
import {
  getTmdbPosterUrl,
  getTmdbBackdropUrl,
} from "../../utils/movies/tmdb-image";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";

export function MovieDetailPage() {
  const { movieId: movieIdParam } = useParams({
    from: "/movies/$movieId",
  });

  const movieId = Number(movieIdParam);
  const isValidMovieId =
    Number.isInteger(movieId) && movieId > 0;

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const queryClient = useQueryClient();
  const memberId = getMemberId(accessToken);

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratingMessageType, setRatingMessageType] = useState<
    "success" | "error"
  >("success");

  const movieDetailQuery = useQuery({
    ...movieQueries.detail(movieId),
    enabled: isValidMovieId,
  });

  const movie = movieDetailQuery.data;

  const favoriteStatusQuery = useQuery({
    queryKey: ["favorites", "status", movieId],
    queryFn: () => getFavoriteStatus(movieId),
    enabled: isValidMovieId && Boolean(accessToken),
    retry: false,
  });

  const isBookmarked = favoriteStatusQuery.data ?? false;

  const createFavoriteMutation = useMutation({
    mutationFn: () => createFavorite(movieId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["favorites"],
      });
    },
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: () => deleteFavorite(movieId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["favorites"],
      });
    },
  });

  const isFavoriteUpdating =
    createFavoriteMutation.isPending ||
    deleteFavoriteMutation.isPending;

  const favoriteMutationError =
    createFavoriteMutation.isError ||
    deleteFavoriteMutation.isError;

  const handleToggleFavorite = () => {
    if (!accessToken) {
      alert("로그인 후 즐겨찾기를 이용할 수 있어요.");
      return;
    }

    if (isFavoriteUpdating || favoriteStatusQuery.isPending) {
      return;
    }

    if (isBookmarked) {
      deleteFavoriteMutation.mutate();
    } else {
      createFavoriteMutation.mutate();
    }
  };

  const myRatingsQuery = useQuery({
    queryKey: ["ratings", "member", memberId],
    queryFn: () => getMemberRatings(memberId!),
    enabled: isValidMovieId && memberId !== null && Boolean(accessToken),
    retry: false,
  });

  const myRating = myRatingsQuery.data?.find(
    (rating) => rating.movieId === movieId
  );

  useEffect(() => {
    setScore(myRating?.score ?? 0);
    setComment(myRating?.comment ?? "");
    setRatingMessage("");
  }, [
    movieId,
    accessToken,
    myRating?.ratingId,
    myRating?.score,
    myRating?.comment,
  ]);

  const createRatingMutation = useMutation({
    mutationFn: () =>
      createRating(movieId, {
        score,
        comment,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["ratings", "member", memberId],
      });
      setRatingMessageType("success");
      setRatingMessage("평점이 등록되었습니다.");
    },
    onError: () => {
      setRatingMessageType("error");
      setRatingMessage("평점 등록에 실패했어요.");
    },
  });

  const updateRatingMutation = useMutation({
    mutationFn: (ratingId: number) =>
      updateRating(ratingId, {
        score,
        comment,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["ratings", "member", memberId],
      });
      setRatingMessageType("success");
      setRatingMessage("평점이 수정되었습니다.");
    },
    onError: () => {
      setRatingMessageType("error");
      setRatingMessage("평점 수정에 실패했어요.");
    },
  });

  const deleteRatingMutation = useMutation({
    mutationFn: (ratingId: number) =>
      deleteRating(ratingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["ratings", "member", memberId],
      });
      setScore(0);
      setComment("");
      setRatingMessageType("success");
      setRatingMessage("평점이 삭제되었습니다.");
    },
    onError: () => {
      setRatingMessageType("error");
      setRatingMessage("평점 삭제에 실패했어요.");
    },
  });

  const isRatingUpdating =
    createRatingMutation.isPending ||
    updateRatingMutation.isPending ||
    deleteRatingMutation.isPending;

  const handleSaveRating = () => {
    if (!accessToken) {
      alert("로그인 후 평점을 등록할 수 있어요.");
      return;
    }

    if (myRatingsQuery.isPending || myRatingsQuery.isError) {
      alert("평점 조회가 완료되지 않았어요.");
      return;
    }

    if (isRatingUpdating) {
      return;
    }

    if (score < 1 || score > 5) {
      alert("별점을 1~5점 중에서 선택해 주세요.");
      return;
    }

    if (comment.length > 500) {
      alert("후기는 500자 이하로 입력해 주세요.");
      return;
    }

    setRatingMessage("");

    if (myRating) {
      updateRatingMutation.mutate(myRating.ratingId);
    } else {
      createRatingMutation.mutate();
    }
  };

  const handleDeleteRating = () => {
    if (!myRating || isRatingUpdating) {
      return;
    }

    if (!window.confirm("등록한 평점을 삭제하시겠습니까?")) {
      return;
    }

    setRatingMessage("");
    deleteRatingMutation.mutate(myRating.ratingId);
  };

  if (!isValidMovieId) {
    return (
      <main className="mx-auto max-w-[1040px] px-5 py-8 sm:px-10">
        <p>올바르지 않은 영화 번호예요.</p>
      </main>
    );
  }

  if (movieDetailQuery.isPending) {
    return (
      <main className="mx-auto max-w-[1040px] px-5 py-8 sm:px-10">
        <p>영화 상세 정보를 불러오는 중이에요.</p>
      </main>
    );
  }

  if (movieDetailQuery.isError) {
    return (
      <main className="mx-auto max-w-[1040px] px-5 py-8 sm:px-10">
        <p>
          {getMovieDetailErrorMessage(movieDetailQuery.error)}
        </p>
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="mx-auto max-w-[1040px] px-5 py-8 sm:px-10">
        <p>영화 정보를 표시할 수 없어요.</p>
      </main>
    );
  }

  const posterUrl = getTmdbPosterUrl(movie.poster_path);
  const backdropUrl = getTmdbBackdropUrl(movie.backdrop_path);

  const genres = movie.genres
    .map((genre) => genre.name)
    .join(", ");

  const runtime =
    typeof movie.runtime === "number"
      ? `${Math.floor(movie.runtime / 60)}시간 ${movie.runtime % 60}분`
      : "상영 시간 정보가 없어요.";

  return (
    <main className="bg-[#f5f6f8]">
      <section className="relative h-[280px] overflow-hidden sm:h-[330px]">
        {backdropUrl ? (
          <img
            className="h-full w-full object-cover"
            src={backdropUrl}
            alt=""
            aria-hidden="true"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-300 text-gray-600">
            이미지 없음
          </div>
        )}

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 mx-auto flex max-w-[1040px] flex-col justify-between px-5 py-6 sm:px-10">
          <Link
            className="w-fit text-sm text-white no-underline"
            to="/"
          >
            ‹ 영화 목록
          </Link>

          <div className="pb-2 text-white">
            <h1 className="mb-1 text-[24px] font-bold sm:text-[30px]">
              {movie.title}
            </h1>

            <p className="mb-1 text-sm">
              {movie.original_title}
            </p>

            <p className="text-xs">
              {movie.release_date} · {genres} · {runtime}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1040px] grid-cols-1 gap-6 px-5 py-6 sm:px-10 lg:grid-cols-[155px_1fr_250px]">
        {posterUrl ? (
          <img
            className="h-[230px] w-[155px] rounded-[6px] object-cover"
            src={posterUrl}
            alt={`${movie.title} 포스터`}
          />
        ) : (
          <div className="flex h-[230px] w-[155px] items-center justify-center rounded-[6px] bg-gray-300 text-xs text-gray-600">
            이미지 없음
          </div>
        )}

        <div className="min-w-0">
          <h2 className="mb-3 text-lg font-bold">
            {movie.tagline}
          </h2>

          <p className="text-sm leading-7 text-[#666666]">
            {movie.overview}
          </p>

          <button
            type="button"
            disabled={
              isFavoriteUpdating ||
              (Boolean(accessToken) &&
                (favoriteStatusQuery.isPending ||
                  favoriteStatusQuery.isError))
            }
            className={cn(
              "mt-5 flex cursor-pointer items-center gap-2 rounded-[6px] border-0 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60",
              isBookmarked ? "bg-blue-700" : "bg-blue-600"
            )}
            onClick={handleToggleFavorite}
          >
            <img
              className="h-4 w-4 brightness-0 invert"
              src={
                isBookmarked
                  ? "/icons/bookmark.svg"
                  : "/icons/bookmark-outline.svg"
              }
              alt=""
            />

            {isFavoriteUpdating
              ? "처리 중..."
              : isBookmarked
                ? "즐겨찾기 해제"
                : "즐겨찾기"}
          </button>

          {favoriteStatusQuery.isError && accessToken && (
            <p className="mt-2 text-xs text-red-500">
              즐겨찾기 상태를 불러오지 못했어요.
            </p>
          )}

          {favoriteMutationError && (
            <p className="mt-2 text-xs text-red-500">
              즐겨찾기 변경에 실패했어요.
            </p>
          )}
        </div>

        <aside className="border-t border-[#e5e7eb] pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <h2 className="mb-1 text-lg font-bold">
            내 평점
          </h2>

          <p className="mb-3 text-xs text-[#9ca3af]">
            {myRating
              ? "등록한 별점과 평가를 수정할 수 있어요."
              : "별점을 선택하고 평가를 남겨보세요."}
          </p>

          {accessToken && myRatingsQuery.isPending && (
            <p className="mb-3 text-xs text-[#9ca3af]">
              평점 정보를 불러오는 중이에요.
            </p>
          )}

          {accessToken && myRatingsQuery.isError && (
            <p className="mb-3 text-xs text-red-500">
              평점 정보를 불러오지 못했어요.
            </p>
          )}

          <div className="mb-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={isRatingUpdating}
                onClick={() => {
                  setScore(star);
                  setRatingMessage("");
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white text-xl disabled:cursor-not-allowed disabled:opacity-60",
                  star <= score
                    ? "text-yellow-400"
                    : "text-[#9ca3af]"
                )}
                aria-label={`${star}점`}
                aria-pressed={score === star}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            className="mb-3 h-[90px] w-full resize-none rounded-[6px] border border-[#e5e7eb] bg-white p-3 text-xs outline-none"
            placeholder="영화에 남기고 싶은 평을 남겨보세요."
            value={comment}
            maxLength={500}
            disabled={isRatingUpdating}
            onChange={(event) => {
              setComment(event.target.value);
              setRatingMessage("");
            }}
          />

          <button
            type="button"
            onClick={handleSaveRating}
            disabled={
              isRatingUpdating ||
              (Boolean(accessToken) &&
                (myRatingsQuery.isPending ||
                  myRatingsQuery.isError))
            }
            className="w-full rounded-[6px] border-0 bg-[#111111] py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRatingUpdating
              ? "처리 중..."
              : myRating
                ? "평점 수정"
                : "평점 저장"}
          </button>

          {myRating && (
            <button
              type="button"
              onClick={handleDeleteRating}
              disabled={isRatingUpdating}
              className="mt-2 w-full rounded-[6px] border border-red-400 bg-white py-2 text-sm font-semibold text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              평점 삭제
            </button>
          )}

          {ratingMessage && (
            <p
              className={cn(
                "mt-2 text-xs",
                ratingMessageType === "success"
                  ? "text-green-600"
                  : "text-red-500"
              )}
            >
              {ratingMessage}
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}
