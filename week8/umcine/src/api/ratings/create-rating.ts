import { authApi } from "../auth-api";
import type {
  Rating,
  RatingApiResponse,
  RatingRequest,
} from "./rating-types";

export async function createRating(
  movieId: number,
  request: RatingRequest
): Promise<Rating> {
  const response = await authApi
    .post("ratings", {
      json: {
        movieId,
        ...request,
      },
    })
    .json<RatingApiResponse>();

  return response.result;
}