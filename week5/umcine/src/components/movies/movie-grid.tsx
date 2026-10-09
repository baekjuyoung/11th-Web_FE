import type { TmdbMovieListItem } from "../../api/movies/models";
import { toMovieListItem } from "../../api/movies/movie-adapter";
import MovieCard from "./movie-card";

interface MovieGridProps {
  movies: TmdbMovieListItem[];
  cardSize: "small" | "large";
}

export default function MovieGrid({
  movies,
  cardSize,
}: MovieGridProps) {
  return (
    <section
      className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${
        cardSize === "small"
          ? "lg:grid-cols-3 xl:grid-cols-5"
          : "lg:grid-cols-3"
      }`}
    >
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={toMovieListItem(movie)}
        />
      ))}
    </section>
  );
}