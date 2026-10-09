
import { Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import type { TmdbMovieDetail } from "../../api/movies/models";
import { useBookmarkStore } from "../../stores/bookmark-store";
import { cn } from "../../utils/cn";
import {
  getTmdbPosterUrl,
  getTmdbBackdropUrl,
} from "../../utils/movies/tmdb-image";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const parsedMovieId = Number(movieId);

  const [movie, setMovie] = useState<TmdbMovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isBookmarked = useBookmarkStore((state) =>
    movie ? state.bookmarkedMovieIds.includes(movie.id) : false,
  );

  const toggleBookmark = useBookmarkStore(
    (state) => state.toggleBookmark,
  );

  useEffect(() => {
    let ignore = false;

    setMovie(null);
    setErrorMessage(null);

    if (!Number.isInteger(parsedMovieId) || parsedMovieId <= 0) {
      setErrorMessage("올바르지 않은 영화 번호예요.");
      setIsLoading(false);
      return;
    }

    async function loadMovie() {
      setIsLoading(true);

      try {
        const response = await getMovieDetail(parsedMovieId);
        if (!ignore) setMovie(response);
      } catch (error) {
        if (!ignore) {
          setErrorMessage(getMovieDetailErrorMessage(error));
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadMovie();

    return () => {
      ignore = true;
    };
  }, [parsedMovieId]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1040px] px-5 py-8 sm:px-10">
        <p>영화 정보를 불러오는 중이에요.</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="mx-auto max-w-[1040px] px-5 py-8 sm:px-10">
        <p>{errorMessage}</p>
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

  const genres = movie.genres.map((genre) => genre.name).join(", ");

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
            className={cn(
              "mt-5 flex cursor-pointer items-center gap-2 rounded-[6px] border-0 px-4 py-2 text-sm font-semibold text-white",
              isBookmarked ? "bg-blue-700" : "bg-blue-600",
            )}
            onClick={() => toggleBookmark(movie.id)}
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

            {isBookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
          </button>
        </div>

        <aside className="border-t border-[#e5e7eb] pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <h2 className="mb-1 text-lg font-bold">
            내 평점
          </h2>

          <p className="mb-3 text-xs text-[#9ca3af]">
            별점을 선택하고 평가를 남겨보세요.
          </p>

          <div className="mb-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#e5e7eb] bg-white text-xl text-[#9ca3af]"
                aria-label={`${star}점`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            className="mb-3 h-[90px] w-full resize-none rounded-[6px] border border-[#e5e7eb] bg-white p-3 text-xs outline-none"
            placeholder="영화에 남기고 싶은 평을 남겨보세요."
          />

          <button
            type="button"
            className="w-full rounded-[6px] border-0 bg-[#111111] py-2 text-sm font-semibold text-white"
          >
            평점 저장
          </button>
        </aside>
      </section>
    </main>
  );
}