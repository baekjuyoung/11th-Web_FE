import { queryOptions } from "@tanstack/react-query";
import { getMovies } from "./get-movies";
import { searchMovies } from "./search-movies";
import { getMovieDetail } from "./get-movie-detail";

export const movieQueries = {
  list: (page: number) =>
    queryOptions({
      queryKey: ["movies", "list", { page }],
      queryFn: () => getMovies({ page }),
    }),

  search: (query: string) =>
    queryOptions({
      queryKey: ["movies", "search", { query }],
      queryFn: () => searchMovies({ query }),
      enabled: query.length > 0,
    }),

  detail: (movieId: number) =>
    queryOptions({
      queryKey: ["movies", "detail", movieId],
      queryFn: () => getMovieDetail(movieId),
      enabled: Number.isInteger(movieId) && movieId > 0,
      staleTime: 30 * 1000,
    }),
};