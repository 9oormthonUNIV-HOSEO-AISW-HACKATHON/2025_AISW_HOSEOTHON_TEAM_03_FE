import { instance } from "../apis/instance";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Profile, Ranking } from "../types/profile";

export const useProfile = () => {
  return useSuspenseQuery<Profile>({
    queryKey: ["user"],
    queryFn: () => instance.get("/v1/members/profile"),
  });
};

export const useRanking = () => {
  return useSuspenseQuery<Ranking>({
    queryKey: ["ranking"],
    queryFn: () => instance.get("/v1/rankings?page=1"),
  });
};
