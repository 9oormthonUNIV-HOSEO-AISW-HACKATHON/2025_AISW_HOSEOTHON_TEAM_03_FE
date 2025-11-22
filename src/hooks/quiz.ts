import { instance } from "../apis/instance";
import { useSuspenseQuery } from "@tanstack/react-query";

type QuestionList = {
  questionId: number;
  content: string;
  correctOption: string;
  explanation: string;
}[];

export const useQuiz = (quizId: string) => {
  const response = useSuspenseQuery<QuestionList>({
    queryKey: ["quiz"],
    queryFn: () => instance.get(`/v1/quiz/${quizId}/questions/results`),
  });
  return response.data;
};
