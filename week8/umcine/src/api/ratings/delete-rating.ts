import { authApi } from "../auth-api";

export async function deleteRating(
  ratingId: number
): Promise<void> {
  await authApi.delete(`ratings/${ratingId}`);
}