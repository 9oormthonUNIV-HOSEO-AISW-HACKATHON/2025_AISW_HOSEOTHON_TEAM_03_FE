import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getWS, send } from "../utils/websocket";
import type { QuizQuestion } from "./Main";

interface QuizLocationState {
  questions: QuizQuestion[];
  quizId: string;
}

interface AnswerResult {
  type: "ANSWER_RESULT" | "ANSWER_DONE";
  quizId: string;
  questionId: number;
  answeredBy: number;
  correct: boolean;
  score: {
    [key: string]: number;
  };
}

function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as QuizLocationState | null;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false); // 두 사람 모두 답변했을 때 정답 공개
  const [currentScore, setCurrentScore] = useState<{ [key: string]: number }>(
    {}
  ); // 현재 점수 상태

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerEventCountRef = useRef<{ [questionId: number]: number }>({});
  const currentQuestionIndexRef = useRef(0);
  const isMovingToNextRef = useRef(false); // 다음 문제로 이동 중인지 확인
  const pendingAnswerRef = useRef<number | null>(null); // 선택한 답변의 최신 값을 유지하기 위한 ref

  useEffect(() => {
    // 퀴즈 데이터가 없으면 Main 페이지로 리다이렉트
    if (!state || !state.questions || !state.quizId) {
      console.warn("퀴즈 데이터가 없습니다. Main 페이지로 이동합니다.");
      navigate("/main", { replace: true });
      return;
    }

    // 웹소켓 메시지 리스너 등록
    const ws = getWS();
    if (ws) {
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Quiz 페이지에서 메시지 수신:", data);

          // ANSWER_RESULT 또는 ANSWER_DONE 처리
          if (data.type === "ANSWER_RESULT" || data.type === "ANSWER_DONE") {
            handleAnswerResult(data as AnswerResult);
          }
        } catch (error) {
          console.error("메시지 파싱 오류:", error);
        }
      };

      ws.addEventListener("message", handleMessage);

      // 첫 문제 로드
      loadQuestion(0);

      return () => {
        ws.removeEventListener("message", handleMessage);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // 타이머 시작
  useEffect(() => {
    if (gameFinished || !state) return;

    setTimeLeft(10);
    setHasAnswered(false);
    setSelectedAnswer(null);
    pendingAnswerRef.current = null; // 새 문제 시작 시 대기 중인 답변 초기화

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    let submitted = false;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          // 시간 초과 시 자동 제출 (선택한 답변이 있으면 그것을, 없으면 -1)
          if (!submitted) {
            submitted = true;
            submitAnswer();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, gameFinished, state]);

  const loadQuestion = (index: number) => {
    if (!state || index >= state.questions.length) {
      return;
    }
    currentQuestionIndexRef.current = index;
    isMovingToNextRef.current = false; // 새 문제 로드 시 플래그 리셋
    setCurrentQuestionIndex(index);
    setTimeLeft(10);
    setHasAnswered(false);
    setSelectedAnswer(null);
    setShowCorrectAnswer(false); // 새 문제 로드 시 정답 공개 상태 리셋
    pendingAnswerRef.current = null; // 새 문제 로드 시 대기 중인 답변 초기화
    // 점수는 유지 (누적되므로 초기화하지 않음)
  };

  const handleAnswerResult = (result: AnswerResult) => {
    // ANSWER_RESULT/ANSWER_DONE 전체 데이터 로그 출력
    console.log("========================================");
    console.log(`📥 [${result.type}] 메시지 수신`);
    console.log("전체 데이터:", JSON.stringify(result, null, 2));
    console.log("========================================");

    const questionId = result.questionId;
    const currentIndex = currentQuestionIndexRef.current;

    // 현재 문제의 questionId와 일치하는지 확인
    if (!state || !state.questions[currentIndex]) {
      console.warn("현재 문제가 없습니다.");
      return;
    }

    const currentQuestionId = state.questions[currentIndex].id;

    // 현재 문제의 결과가 아니면 무시
    if (questionId !== currentQuestionId) {
      console.log(
        `다른 문제의 결과입니다. 현재: ${currentQuestionId}, 수신: ${questionId}`
      );
      return;
    }

    // questionId별 이벤트 카운트 증가
    if (!answerEventCountRef.current[questionId]) {
      answerEventCountRef.current[questionId] = 0;
    }
    answerEventCountRef.current[questionId] += 1;

    const count = answerEventCountRef.current[questionId];
    console.log(
      `ANSWER_RESULT/ANSWER_DONE 수신: questionId=${questionId}, count=${count}, 현재 문제 인덱스: ${currentIndex}`
    );

    // 결과 저장
    setLastResult(result);

    // 점수 업데이트 (항상 최신 점수로 업데이트)
    if (result.score && typeof result.score === "object") {
      const newScore = { ...result.score };
      console.log("점수 업데이트 전:", currentScore);
      console.log("새로운 점수:", newScore);
      setCurrentScore(newScore);
      console.log("점수 업데이트 완료:", newScore);
    } else {
      console.warn("점수 정보가 없거나 잘못된 형식입니다:", result);
    }

    // 두 명 모두 답변했을 때 정답 공개
    if (count >= 2) {
      setShowCorrectAnswer(true);
      console.log("두 명 모두 답변 완료! 정답을 공개합니다.");
    }

    // 두 명 모두 답변했을 때만 다음 문제로 이동 (중복 실행 방지)
    if (count >= 2 && !isMovingToNextRef.current) {
      isMovingToNextRef.current = true; // 이동 시작 플래그 설정
      console.log("두 명 모두 답변 완료! 다음 문제로 이동합니다.");
      setTimeout(() => {
        goToNextQuestion(result.type);
      }, 2000); // 2초 후 다음 문제로
    } else if (count < 2) {
      console.log(`아직 모든 플레이어가 답변하지 않았습니다. (${count}/2)`);
    }

    // 마지막 문제이고 ANSWER_DONE이면 게임 종료
    if (
      result.type === "ANSWER_DONE" &&
      currentIndex >= (state?.questions.length || 0) - 1
    ) {
      setTimeout(() => {
        setGameFinished(true);
        console.log("게임 종료! 최종 점수:", result.score);

        // 결과 페이지로 이동하면서 quizId와 최종 점수 전달
        if (state?.quizId) {
          try {
            navigate("/result", {
              state: {
                quizId: state.quizId,
                finalScore: result.score,
              },
              replace: false,
            });
            console.log(
              "✅ Result 페이지로 이동 완료 (quizId:",
              state.quizId,
              ")"
            );
          } catch (error) {
            console.error("❌ Result 페이지 이동 실패:", error);
          }
        } else {
          console.warn("quizId가 없어서 Result 페이지로 이동할 수 없습니다.");
        }
      }, 2000);
    }
  };

  const goToNextQuestion = (lastType: string) => {
    if (!state) return;

    const currentIndex = currentQuestionIndexRef.current;
    const nextIndex = currentIndex + 1;

    console.log(
      `다음 문제로 이동: 현재 인덱스=${currentIndex}, 다음 인덱스=${nextIndex}, 총 문제 수=${state.questions.length}`
    );

    if (nextIndex < state.questions.length) {
      loadQuestion(nextIndex);
    } else {
      setGameFinished(true);
      console.log("모든 문제가 끝났습니다!");
      if (lastType !== "ANSWER_DONE") {
        console.warn("마지막 응답 type이 ANSWER_DONE이 아닙니다.");
      }
      // 마지막 문제 후 결과 페이지로 이동은 handleAnswerResult에서 처리
    }
  };

  // 실제 답변 제출 함수 (10초 후 자동 호출)
  const submitAnswer = () => {
    if (hasAnswered || !state) return;

    setHasAnswered(true);
    const question = state.questions[currentQuestionIndex];
    if (!question) return;

    // 선택한 답변이 있으면 그것을, 없으면 -1 제출 (ref에서 최신 값 읽기)
    const answerToSubmit =
      pendingAnswerRef.current !== null ? pendingAnswerRef.current : -1;

    console.log("========================================");
    console.log("📤 ANSWER_SUBMIT 제출");
    console.log("questionId:", question.id);
    console.log("answerIndex:", answerToSubmit);
    console.log("pendingAnswerRef.current:", pendingAnswerRef.current);
    console.log("========================================");

    setSelectedAnswer(pendingAnswerRef.current); // 선택한 답변을 표시용으로 설정

    send({
      type: "ANSWER_SUBMIT",
      quizId: state.quizId,
      questionId: question.id,
      answerIndex: answerToSubmit,
    });

    if (answerToSubmit === -1) {
      console.log("⏱️ 시간 초과! 자동 제출(-1)");
    } else {
      console.log(`📤 자동 제출: answerIndex=${answerToSubmit}`);
    }
  };

  // 답변 선택 (10초 후 자동 제출되도록 선택만 저장)
  const handleAnswerSelect = (answerIndex: number) => {
    if (hasAnswered || !state) return;

    // 답변 선택만 하고 제출하지 않음 (10초 후 자동 제출)
    console.log(`답변 선택: ${answerIndex} (0-3 중 하나, 10초 후 자동 제출)`);
    pendingAnswerRef.current = answerIndex; // ref에 저장하여 최신 값 유지
    setSelectedAnswer(answerIndex); // UI 표시용
  };

  // 퀴즈 데이터가 없으면 아무것도 렌더링하지 않음
  if (!state || !state.questions || !state.quizId) {
    return null;
  }

  const currentQuestion = state.questions[currentQuestionIndex];

  if (gameFinished) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-6">🎉 게임 종료!</h1>
          {lastResult && (
            <div className="space-y-4">
              <p className="text-2xl mb-4">최종 점수</p>
              <div className="space-y-2">
                {Object.entries(lastResult.score).map(([member, score]) => (
                  <div key={member} className="text-xl">
                    {member}: {score}점
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-2xl">문제를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">퀴즈 게임</h1>
          <div className="flex items-center justify-between">
            <p className="text-lg text-gray-600">
              문제 {currentQuestionIndex + 1} / {state.questions.length}
            </p>
            <div className="flex items-center gap-6">
              {/* 점수 현황 */}
              {(Object.keys(currentScore).length > 0 || lastResult?.score) && (
                <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-md">
                  <span className="text-sm font-semibold text-gray-600">
                    점수:
                  </span>
                  <div className="flex items-center gap-2">
                    {(Object.keys(currentScore).length > 0
                      ? Object.entries(currentScore)
                      : lastResult?.score
                      ? Object.entries(lastResult.score)
                      : []
                    ).map(([member, score], index, array) => (
                      <span
                        key={member}
                        className="text-lg font-bold text-primary"
                      >
                        {member}: {score}점{index < array.length - 1 && " | "}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* 타이머 */}
              <div
                className={`text-2xl font-bold ${
                  timeLeft <= 3 ? "text-red-500" : "text-gray-700"
                }`}
              >
                ⏱️ {timeLeft}초
              </div>
            </div>
          </div>
        </div>

        {/* 문제 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="mb-6">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
              {currentQuestion.category}
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            {currentQuestion.content}
          </h2>

          {/* 보기 */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = option.correct;
              const showAnswer = showCorrectAnswer && isCorrect; // 두 사람 모두 답변했을 때만 정답 표시

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                    hasAnswered
                      ? showAnswer
                        ? "bg-green-100 border-green-500"
                        : isSelected && showCorrectAnswer
                        ? "bg-red-100 border-red-500"
                        : isSelected
                        ? "bg-gray-300 border-gray-500"
                        : "bg-gray-50 border-gray-200"
                      : isSelected
                      ? "bg-primary/10 border-primary"
                      : "bg-white border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                  } ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                        hasAnswered
                          ? showAnswer
                            ? "bg-green-500 text-white"
                            : isSelected && showCorrectAnswer
                            ? "bg-red-500 text-white"
                            : isSelected
                            ? "bg-gray-500 text-white"
                            : "bg-gray-200 text-gray-600"
                          : isSelected
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-xl flex-1">{option.content}</span>
                    {showAnswer && (
                      <span className="text-green-600 font-bold">✓ 정답</span>
                    )}
                    {/* 두 사람 모두 답변했을 때만 오답 표시 */}
                    {hasAnswered &&
                      isSelected &&
                      !showAnswer &&
                      showCorrectAnswer && (
                        <span className="text-red-600 font-bold">✗ 오답</span>
                      )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
