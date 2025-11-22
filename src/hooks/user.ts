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

  return response.data;
};
