import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import MovieGrid from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { getMovies } from "../../api/movies/get-movies";
import type { TmdbMovieListItem } from "../../api/movies/models";

export function MovieListPage() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate({ from: "/" });

  const rawPage = Number((search as { page?: number | string }).page ?? 1);
  const currentPage =
    Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= 5
      ? rawPage
      : 1;

  const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [cardSize, setCardSize] = useState<"small" | "large">(() => {
    const savedCardSize = localStorage.getItem("umcine-card-size");
    return savedCardSize === "large" ? "large" : "small";
  });

  const handleCardSize = (size: "small" | "large") => {
    setCardSize(size);
    localStorage.setItem("umcine-card-size", size);
  };

  const handlePageChange = (page: number) => {
    navigate({
      search: { page },
    });
  };

  useEffect(() => {
    let ignore = false;

    async function loadMovies() {
      setIsLoading(true);
      setErrorMessage(null);
      setMovies([]);

      try {
        const response = await getMovies({ page: currentPage });

        if (!ignore) {
          setMovies(response.results);
        }
      } catch {
        if (!ignore) {
          setErrorMessage("영화 목록을 불러오지 못했어요.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadMovies();

    return () => {
      ignore = true;
    };
  }, [currentPage, retryCount]);

  return (
    <main className="mx-auto max-w-[1040px] px-10 pt-8 pb-[60px]">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[22px] font-bold">영화 목록</h1>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleCardSize("small")}
            className={`cursor-pointer rounded border px-3 py-1 text-sm ${
              cardSize === "small"
                ? "border-black bg-black text-white"
                : "border-black bg-white text-black"
            }`}
          >
            작게
          </button>

          <button
            type="button"
            onClick={() => handleCardSize("large")}
            className={`cursor-pointer rounded border px-3 py-1 text-sm ${
              cardSize === "large"
                ? "border-black bg-black text-white"
                : "border-black bg-white text-black"
            }`}
          >
            크게
          </button>
        </div>
      </div>

      {isLoading && <p>영화 목록을 불러오는 중...</p>}

      {!isLoading && errorMessage && (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-sm text-red-600">{errorMessage}</p>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="cursor-pointer rounded-[6px] bg-black px-5 py-2 text-sm font-semibold text-white"
          >
            다시 시도
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <MovieGrid movies={movies} cardSize={cardSize} />
      )}

      <Pagination
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </main>
  );
}