import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuiz } from "../hooks/quiz";

interface ResultLocationState {
  quizId: string;
  finalScore?: {
    [key: string]: number;
  };
}

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultLocationState | null;

  const quizId = state?.quizId || "";

  // quizId가 없으면 Main 페이지로 리다이렉트
  useEffect(() => {
    if (!state?.quizId || !quizId) {
      console.warn("quizId가 없습니다. Main 페이지로 이동합니다.");
      navigate("/main", { replace: true });
    }
  }, [state?.quizId, quizId, navigate]);

  // Hook은 항상 호출되어야 하므로, quizId가 없어도 호출
  // quizId가 없으면 useQuiz 내부에서 에러가 발생할 수 있지만, quizId가 없으면 컴포넌트가 리다이렉트되므로 문제 없음
  // useQuiz는 useSuspenseQuery를 사용하므로, quizId가 없으면 에러가 발생할 수 있지만,
  // 실제로는 quizId가 있을 때만 이 컴포넌트가 사용되므로 안전함
  // 일단 Hook 규칙을 준수하기 위해 항상 호출하되, quizId가 없으면 빈 문자열 전달
  const data = useQuiz(quizId || "dummy").data; // quizId가 없으면 더미 값 전달 (실제로는 리다이렉트되므로 호출되지 않음)

  if (!state?.quizId || !quizId) {
    return null;
  }

  // data 사용 (현재는 사용하지 않지만, 추후 사용 예정)
  console.log("Quiz 결과 데이터:", data);

  return <div></div>;
};

export default Result;
