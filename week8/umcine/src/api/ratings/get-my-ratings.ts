
import { authApi } from "../auth-api";
import type { Rating } from "./rating-types";

interface MyRatingsResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Rating[];
}

// JWT를 이용해 로그인한 회원의 평점 목록 조회
export async function getMyRatings(): Promise<Rating[]> {
  const response = await authApi
    .get("ratings/me")
    .json<MyRatingsResponse>();

  return response.result;
}
