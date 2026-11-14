import { authApi } from "../auth-api";
import type { Rating } from "./rating-types";

export async function getMemberRatings(
  memberId: number
): Promise<Rating[]> {
  return authApi
    .get(`members/${memberId}/ratings`)
    .json<Rating[]>();
}