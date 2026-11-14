import { authApi } from "../auth-api";
import type {
  Rating,
  RatingApiResponse,
  RatingRequest,
} from "./rating-types";

export async function updateRating(
  ratingId: number,
  request: RatingRequest
): Promise<Rating> {
  const response = await authApi
    .patch(`ratings/${ratingId}`, {
      json: request,
    })
    .json<RatingApiResponse>();

  return response.result;
}