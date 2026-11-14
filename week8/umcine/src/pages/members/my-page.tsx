
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { movieQueries } from "../../api/movies/movie-queries";
import { getMe } from "../../api/members/me";
import { getFavorites } from "../../api/favorites/get-favorites";
import { useAuthStore } from "../../stores/auth-store";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

const MOVIES_PER_PAGE = 5;

export function MyPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const accessToken = useAuthStore((state) => state.accessToken);

  // 내 정보 조회
  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // 백엔드에서 내 즐겨찾기 목록 조회
  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    enabled: Boolean(accessToken),
    retry: false,
  });

  const bookmarkedMovieIds =
    favoritesQuery.data?.map((favorite) => favorite.movieId) ?? [];

  // 즐겨찾기한 영화들의 상세 정보 조회
  const movieQueriesResults = useQueries({
    queries: bookmarkedMovieIds.map((movieId) =>
      movieQueries.detail(movieId)
    ),
  });

  const isLoading =
    favoritesQuery.isPending ||
    movieQueriesResults.some((query) => query.isPending);

  const hasError =
    favoritesQuery.isError ||
    movieQueriesResults.some((query) => query.isError);

  // 정상적으로 조회된 영화만 목록에 포함
  const favoriteMovies = movieQueriesResults
    .map((query) => query.data)
    .filter((movie) => movie !== undefined);

  const totalPages = Math.ceil(
    favoriteMovies.length / MOVIES_PER_PAGE
  );

  const safeCurrentPage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const startIndex = (safeCurrentPage - 1) * MOVIES_PER_PAGE;

  const visibleMovies = favoriteMovies.slice(
    startIndex,
    startIndex + MOVIES_PER_PAGE
  );

  return (
    <main className="min-h-[calc(100vh-128px)] bg-[#f7f8fa] px-4 py-8 md:px-[30px] lg:px-20">
      <div className="mx-auto max-w-7xl">
        {/* 페이지 제목 */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-[#17191f]">
            내 정보
          </h1>

          <Link
            to="/my/edit"
            className="rounded-md bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          >
            정보 수정
          </Link>
        </div>

        {/* 기본 정보 */}
        <section className="border-b border-gray-200 py-6">
          <h2 className="mb-4 text-base font-bold text-[#17191f]">
            기본 정보
          </h2>

          {!accessToken ? (
            <p className="py-6 text-sm text-gray-500">
              로그인 후 내 정보를 확인할 수 있어요.
            </p>
          ) : meQuery.isPending ? (
            <p className="py-6 text-sm text-gray-500">
              내 정보를 불러오는 중이에요.
            </p>
          ) : meQuery.isError ? (
            <p className="py-6 text-sm text-red-500">
              내 정보를 불러오지 못했어요.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              {/* 프로필 이미지: 기본 아이콘 유지 */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5e7eb]">
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-[#17191f]"
                >
                  <circle cx="12" cy="7" r="4" />
                  <path d="M3 21v-2c0-4 4-6 9-6s9 2 9 6v2H3z" />
                </svg>
              </div>

              {/* 닉네임 */}
              <div className="min-w-[180px] flex-1">
                <p className="mb-1 text-xs text-gray-400">
                  닉네임
                </p>
                <p className="font-semibold text-[#17191f]">
                  {meQuery.data?.nickname}
                </p>
              </div>

              {/* 이메일 */}
              <div className="min-w-[220px] flex-[2]">
                <p className="mb-1 text-xs text-gray-400">
                  이메일
                </p>
                <p className="font-semibold text-[#17191f]">
                  {meQuery.data?.email}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* 즐겨찾기 */}
        <section className="py-6">
          <h2 className="mb-4 text-base font-bold text-[#17191f]">
            내 즐겨찾기
          </h2>

          {favoritesQuery.isPending ? (
            <p className="py-12 text-center text-sm text-gray-500">
              즐겨찾기 목록을 불러오는 중이에요.
            </p>
          ) : favoritesQuery.isError ? (
            <p className="py-12 text-center text-sm text-red-500">
              즐겨찾기 목록을 불러오지 못했어요.
            </p>
          ) : bookmarkedMovieIds.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              아직 즐겨찾기한 영화가 없어요.
            </p>
          ) : (
            <>
              {/* 영화 정보를 불러오는 중 */}
              {isLoading && favoriteMovies.length === 0 && (
                <p className="py-12 text-center text-sm text-gray-500">
                  즐겨찾기한 영화를 불러오는 중이에요.
                </p>
              )}

              {/* 일부 영화 조회 실패 */}
              {hasError && (
                <p className="mb-4 text-sm text-red-500">
                  일부 영화 정보를 불러오지 못했어요.
                </p>
              )}

              {/* 조회된 영화가 하나도 없는 경우 */}
              {!isLoading &&
                favoriteMovies.length === 0 &&
                !hasError && (
                  <p className="py-12 text-center text-sm text-gray-500">
                    표시할 영화가 없어요.
                  </p>
                )}

              {/* 정상적으로 조회된 영화 목록 */}
              {favoriteMovies.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {visibleMovies.map((movie) => {
                      const posterUrl = getTmdbPosterUrl(
                        movie.poster_path
                      );

                      return (
                        <Link
                          key={movie.id}
                          to="/movies/$movieId"
                          params={{
                            movieId: String(movie.id),
                          }}
                          className="text-inherit no-underline"
                        >
                          <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-200">
                            {posterUrl ? (
                              <img
                                src={posterUrl}
                                alt={`${movie.title} 포스터`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                이미지 없음
                              </div>
                            )}
                          </div>

                          <p className="mt-2 text-sm font-semibold text-[#17191f]">
                            {movie.title}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {movie.release_date}
                          </p>
                        </Link>
                      );
                    })}
                  </div>

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-4">
                      <button
                        type="button"
                        disabled={safeCurrentPage === 1}
                        onClick={() =>
                          setCurrentPage(safeCurrentPage - 1)
                        }
                        className="text-xl text-[#2563eb] disabled:text-blue-200"
                      >
                        ‹
                      </button>

                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#17191f] text-sm font-semibold text-white">
                        {safeCurrentPage}
                      </span>

                      <button
                        type="button"
                        disabled={safeCurrentPage === totalPages}
                        onClick={() =>
                          setCurrentPage(safeCurrentPage + 1)
                        }
                        className="text-xl text-[#2563eb] disabled:text-blue-200"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
