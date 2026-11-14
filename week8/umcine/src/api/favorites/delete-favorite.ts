import { authApi } from "../auth-api";

export async function deleteFavorite(
  movieId: number
): Promise<void> {
  await authApi.delete(`favorites/${movieId}`);
}