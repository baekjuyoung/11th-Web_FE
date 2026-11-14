import { Link } from "@tanstack/react-router";
import type { Movie } from "../../types/movie";
import { BookmarkButton } from "../bookmark-button";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="min-w-0">
      <div className="relative h-[210px] w-full">
        <Link
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
        >
          <img
            className="block h-full w-full rounded-[6px] object-cover"
            src={movie.posterPath || "/placeholder.png"}
            alt={`${movie.title} 포스터`}
          />
        </Link>

        <BookmarkButton movieId={movie.id} />
      </div>

      <h2 className="mt-[6px] mb-[2px] text-xs font-semibold leading-[1.3]">
        {movie.title}
      </h2>

      <p className="m-0 text-[10px] text-[#8a8a8a]">
        {movie.releaseDate}
      </p>
    </article>
  );
}