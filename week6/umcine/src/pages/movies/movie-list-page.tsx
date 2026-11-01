
import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import MovieGrid from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { movieQueries } from "../../api/movies/movie-queries";

export function MovieListPage() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate({ from: "/" });

  const rawPage = Number((search as { page?: number | string }).page ?? 1);
  const currentPage =
    Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= 5
      ? rawPage
      : 1;

  const moviesQuery = useQuery(movieQueries.list(currentPage));

  const movies = moviesQuery.data?.results ?? [];

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

      {moviesQuery.isPending ? (
        <p>영화 목록을 불러오는 중...</p>
      ) : moviesQuery.isError ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-sm text-red-600">
            영화 목록을 불러오지 못했어요.
          </p>

          <button
            type="button"
            onClick={() => moviesQuery.refetch()}
            className="cursor-pointer rounded-[6px] bg-black px-5 py-2 text-sm font-semibold text-white"
          >
            다시 시도
          </button>
        </div>
      ) : movies.length === 0 ? (
        <p>표시할 영화가 없어요.</p>
      ) : (
        <MovieGrid movies={movies} cardSize={cardSize} />
      )}

      <Pagination
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </main>
  );
}
