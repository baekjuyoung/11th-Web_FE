import type { Movie } from "../../types/movie";
import type { TmdbMovieDetail, TmdbMovieListItem } from "./models";
import {
  getTmdbPosterUrl,
  getTmdbBackdropUrl,
} from "../../utils/movies/tmdb-image";

export function toMovie(movie: TmdbMovieDetail): Movie {
  const hours = Math.floor((movie.runtime ?? 0) / 60);
  const minutes = (movie.runtime ?? 0) % 60;

  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    releaseDate: movie.release_date.replaceAll("-", "."),
    posterPath: getTmdbPosterUrl(movie.poster_path) ?? "",
    backdropPath: getTmdbBackdropUrl(movie.backdrop_path) ?? "",
    genres: movie.genres.map((genre) => genre.name),
    runtime:
      movie.runtime == null
        ? "상영 시간 정보 없음"
        : `${hours}시간 ${minutes}분`,
    tagline: movie.tagline,
    overview: movie.overview,
    isBookmarked: false,
  };
}

export function toMovieListItem(movie: TmdbMovieListItem): Movie {
  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    releaseDate: movie.release_date.replaceAll("-", "."),
    posterPath: getTmdbPosterUrl(movie.poster_path) ?? "",
    backdropPath: getTmdbBackdropUrl(movie.backdrop_path) ?? "",
    genres: [],
    runtime: "상영 시간 정보 없음",
    tagline: "",
    overview: movie.overview,
    isBookmarked: false,
  };
}