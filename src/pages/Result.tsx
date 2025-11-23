import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuiz } from "../hooks/quiz";
import Header from "../components/Header";

interface ResultLocationState {
  quizId: string;
  finalScore?: {
    [key: string]: number;
  };
}

interface QuestionResult {
  questionId: number;
  content: string;
  correctOption: string;
  explanation: string;
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
  const quizData = useQuiz(quizId || "dummy") as
    | QuestionResult[]
    | { data?: QuestionResult[]; responses?: QuestionResult[] };

  // API 응답 구조에 따라 배열 추출
  let quizResults: QuestionResult[] = [];
  if (Array.isArray(quizData)) {
    quizResults = quizData;
  } else if (quizData && typeof quizData === "object") {
    if ("data" in quizData && Array.isArray(quizData.data)) {
      quizResults = quizData.data;
    } else if ("responses" in quizData && Array.isArray(quizData.responses)) {
      quizResults = quizData.responses;
    }
  }

  console.log("Quiz 결과 데이터:", quizData);
  console.log("추출된 quizResults:", quizResults);

  if (!state?.quizId || !quizId) {
    return null;
  }

  const finalScore = state.finalScore || {};
  const scoreEntries = Object.entries(finalScore);
  const winner =
    scoreEntries.length > 0
      ? scoreEntries.reduce((a, b) => (a[1] > b[1] ? a : b))
      : null;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 최종 결과 헤더 */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-[#05b04a] bg-clip-text text-transparent">
              🎉 게임 종료!
            </h1>
            <div className="mt-6 space-y-4">
              <p className="text-2xl font-bold text-gray-700">최종 점수</p>
              <div className="flex justify-center gap-6">
                {scoreEntries.map(([member, score]) => (
                  <div
                    key={member}
                    className={`px-6 py-4 rounded-xl ${
                      winner && winner[0] === member
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">{member}</div>
                    <div className="text-3xl font-bold">{score}점</div>
                    {winner && winner[0] === member && (
                      <div className="text-xs mt-1">🏆 우승</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 풀이 해설 */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-4xl">📝</span>
            문제 풀이 해설
          </h2>

          {quizResults.map((question, index) => (
            <div
              key={question.questionId}
              className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100 hover:border-primary/30 transition-all duration-300"
            >
              {/* 문제 번호 및 내용 */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#05b04a] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-700">
                    문제 {index + 1}
                  </h3>
                </div>
                <p className="text-2xl font-semibold text-gray-900 leading-relaxed pl-12">
                  {question.content}
                </p>
              </div>

              {/* 정답 */}
              <div className="mb-6 p-6 bg-green-50 rounded-2xl border-2 border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg font-bold text-green-700">정답</span>
                </div>
                <p className="text-xl font-bold text-green-800 ml-8">
                  {question.correctOption}
                </p>
              </div>

              {/* 해설 */}
              <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">💡</span>
                  <span className="text-lg font-bold text-blue-700">해설</span>
                </div>
                <p className="text-lg text-gray-800 leading-relaxed ml-8 whitespace-pre-wrap">
                  {question.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 메인으로 돌아가기 버튼 */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/main")}
            className="px-12 py-4 text-xl font-bold text-white rounded-2xl bg-gradient-to-r from-primary to-[#05b04a] hover:from-[#05b04a] hover:to-primary transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
