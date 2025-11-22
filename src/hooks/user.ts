import { instance } from "../apis/instance";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Profile, Ranking } from "../types/profile";

export const useProfile = () => {
  const response = useSuspenseQuery<Profile>({
    queryKey: ["user"],
    queryFn: () => instance.get("/v1/members/profile"),
  });
  return response.data.data;
};

export const useRanking = () => {
  const response = useSuspenseQuery<Ranking>({
    queryKey: ["ranking"],
    queryFn: () => instance.get("/v1/rankings?page=1"),
  });
  console.log("useRanking - response.data:", response.data);

  const data = response.data;
  // API 응답 구조 확인
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    data.data &&
    typeof data.data === "object" &&
    "responses" in data.data
  ) {
    console.log("useRanking - 중첩된 data 구조 감지:", data.data);
    return data.data as Ranking;
  }
  if (data && typeof data === "object" && "responses" in data) {
    console.log("useRanking - 직접 responses 구조:", data);
    return data;
  }

  console.warn("useRanking - 예상치 못한 응답 구조:", data);
  return data;
};
