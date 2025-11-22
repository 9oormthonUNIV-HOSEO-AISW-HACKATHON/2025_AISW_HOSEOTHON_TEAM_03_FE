import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { QuizQuestion } from "./Main";

interface QuizLocationState {
  questions: QuizQuestion[];
  roomId: string;
}

function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as QuizLocationState | null;

  useEffect(() => {
    // 퀴즈 데이터가 없으면 Main 페이지로 리다이렉트
    if (!state || !state.questions || !state.roomId) {
      console.warn("퀴즈 데이터가 없습니다. Main 페이지로 이동합니다.");
      navigate("/main", { replace: true });
      return;
    }

    console.log("퀴즈 페이지 로드됨");
    console.log("roomId:", state.roomId);
    console.log("questions:", state.questions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // 퀴즈 데이터가 없으면 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!state || !state.questions || !state.roomId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">퀴즈 게임</h1>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <p className="text-lg mb-4">Room ID: {state.roomId}</p>
          <p className="text-lg mb-4">
            총 {state.questions.length}개의 문제가 있습니다.
          </p>
          <div className="space-y-4">
            {state.questions.map((question, idx) => (
              <div key={idx} className="border-b pb-4">
                <h3 className="font-bold text-xl mb-2">
                  Q{idx + 1}. [{question.category}] {question.content}
                </h3>
                <ul className="space-y-2">
                  {question.options.map((option, oIdx) => (
                    <li key={oIdx} className="pl-4">
                      {String.fromCharCode(65 + oIdx)}. {option.content}
                      {option.correct && (
                        <span className="text-green-600 ml-2">(정답)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
