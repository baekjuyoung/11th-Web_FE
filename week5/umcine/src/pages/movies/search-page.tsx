
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type SubmitEvent } from "react";
import { BookmarkButton } from "../../components/bookmark-button";
import { searchMovies } from "../../api/movies/search-movies";
import type { TmdbMovieListItem } from "../../api/movies/models";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export function SearchPage() {
  const { query } = useSearch({ from: "/search" });
  const navigate = useNavigate({ from: "/search" });

  const [searchText, setSearchText] = useState(query ?? "");
  const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSearchText(query ?? "");
  }, [query]);

  useEffect(() => {
    let ignore = false;
    const normalizedQuery = (query ?? "").trim();

    setMovies([]);
    setErrorMessage(null);

    if (!normalizedQuery) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    searchMovies({ query: normalizedQuery })
      .then((response) => {
        if (!ignore) setMovies(response.results);
      })
      .catch(() => {
        if (!ignore) {
          setErrorMessage("검색 결과를 불러오지 못했어요.");
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [query]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextQuery = searchText.trim();

    navigate({
      search: nextQuery ? { query: nextQuery } : {},
    });
  }

  if (!(query ?? "").trim()) {
    return (
      <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1040px] px-10">
        <div className="flex flex-col items-center pt-[150px]">
          <h1 className="mb-8 text-[28px] font-bold">
            어떤 영화를 찾고 있나요?
          </h1>

          <form
            className="flex w-full max-w-[560px] items-center rounded-[8px] border-2 border-[#6b7280] bg-white p-1"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-1 items-center px-3">
              <img
                className="mr-3 h-4 w-4"
                src="/icons/search.svg"
                alt=""
              />

              <input
                className="w-full border-0 bg-transparent py-2 text-sm outline-none"
                aria-label="검색어"
                placeholder="예: 스파이더맨"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            <button
              className="cursor-pointer rounded-[6px] border-0 bg-[#111111] px-5 py-2 text-sm text-white"
              type="submit"
            >
              검색
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1040px] px-10 pt-8 pb-[60px]">
      <h1 className="mb-5 text-[22px] font-bold">영화 검색</h1>

      <form
        className="mb-4 flex w-full items-center rounded-[6px] border border-[#e5e7eb] bg-white p-1"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-1 items-center px-3">
          <img
            className="mr-3 h-4 w-4"
            src="/icons/search.svg"
            alt=""
          />

          <input
            className="w-full border-0 bg-transparent py-2 text-sm outline-none"
            aria-label="검색어"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />

          {searchText && (
            <button
              type="button"
              className="ml-2 cursor-pointer border-0 bg-transparent px-2 text-lg text-[#6b7280]"
              aria-label="검색어 지우기"
              onClick={() => setSearchText("")}
            >
              ×
            </button>
          )}
        </div>

        <button
          className="cursor-pointer rounded-[6px] border-0 bg-[#111111] px-5 py-2 text-sm text-white"
          type="submit"
        >
          다시 검색
        </button>
      </form>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          ‘{query}’ 검색 결과
        </h2>

        <p className="text-xs text-[#8a8a8a]">
          영화 {isLoading || errorMessage ? 0 : movies.length}편
        </p>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-[#8a8a8a]">
          검색 결과를 불러오는 중이에요.
        </p>
      ) : errorMessage ? (
        <p className="py-16 text-center text-sm text-red-600">
          {errorMessage}
        </p>
      ) : movies.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#8a8a8a]">
          검색 결과가 없어요.
        </p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-x-8 gap-y-5 p-0 md:grid-cols-2">
          {movies.map((movie) => {
            const posterUrl = getTmdbPosterUrl(movie.poster_path);

            return (
              <li
                className="flex gap-4 border-b border-[#e5e7eb] pb-5"
                key={movie.id}
              >
                <div className="relative h-[140px] w-[95px] shrink-0">
                  {posterUrl ? (
                    <img
                      className="h-full w-full rounded-[6px] object-cover"
                      src={posterUrl}
                      alt={`${movie.title} 포스터`}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-gray-200 text-xs text-gray-500">
                      이미지 없음
                    </div>
                  )}

                  <BookmarkButton movieId={movie.id} />
                </div>

                <div className="min-w-0">
                  <h3 className="mb-1 text-sm font-semibold">
                    {movie.title}
                  </h3>

                  <p className="mb-2 text-[11px] text-[#8a8a8a]">
                    {movie.original_title} · {movie.release_date}
                  </p>

                  <p className="mb-3 line-clamp-2 text-xs leading-5 text-[#666666]">
                    {movie.overview}
                  </p>

                  <Link
                    className="text-xs font-semibold text-blue-600 no-underline"
                    to="/movies/$movieId"
                    params={{ movieId: String(movie.id) }}
                  >
                    상세 보기 →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
