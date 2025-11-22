import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getWS, send } from "../utils/websocket";
import { useRanking } from "../hooks/user";

// 퀴즈 문제 타입 정의 (export하여 다른 파일에서도 사용 가능)
export interface QuizOption {
  content: string;
  correct: boolean;
}

export interface QuizQuestion {
  category: string;
  content: string;
  options: QuizOption[];
}

function Main() {
  const ranking = useRanking();
  const navigate = useNavigate();

  // 디버깅: API 응답 구조 확인
  console.log("전체 ranking 객체:", ranking);
  console.log("ranking.responses:", ranking?.responses);
  console.log("ranking 타입:", typeof ranking);
  console.log("responses 타입:", typeof ranking?.responses);
  console.log("isArray?", Array.isArray(ranking?.responses));

  // 실제 랭킹 데이터를 UI에 맞게 변환
  const rankingData = useMemo(() => {
    console.log("rankingData 계산 시작, ranking:", ranking);

    // API 응답 구조가 다를 수 있으므로 여러 경우를 확인
    let responses: Array<{
      nickname: string;
      totalPoints: number;
      grade: string;
      generationRole: string;
    }> | null = null;

    if (ranking?.responses) {
      responses = ranking.responses;
    } else if (
      ranking &&
      typeof ranking === "object" &&
      "data" in ranking &&
      ranking.data &&
      typeof ranking.data === "object" &&
      "responses" in ranking.data &&
      Array.isArray(ranking.data.responses)
    ) {
      responses = ranking.data.responses;
    } else if (Array.isArray(ranking)) {
      responses = ranking;
    }

    console.log("추출된 responses:", responses);

    if (!responses || !Array.isArray(responses)) {
      console.warn("랭킹 데이터를 찾을 수 없습니다. ranking:", ranking);
      return [];
    }

    return responses.map(
      (
        user: {
          nickname: string;
          totalPoints: number;
          grade: string;
          generationRole: string;
        },
        index: number
      ) => ({
        rank: index + 1,
        nickname: user.nickname,
        role: user.generationRole === "SENIOR" ? "시니어" : "MZ",
        score: user.totalPoints,
      })
    );
  }, [ranking]);
  // 매칭 성공 시 받은 roomId 저장
  const [roomId, setRoomId] = useState<string | null>(null);
  // 매칭 팝업 표시 여부
  const [showMatchModal, setShowMatchModal] = useState(false);
  // 수락 처리 중 상태
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    // 웹소켓 연결 (이미 연결되어 있으면 재사용)
    getWS();

    // 메시지 수신을 위해 getWS()로 소켓을 가져와서 직접 이벤트 리스너 등록
    const ws = getWS();
    if (ws) {
      const handleMessage = (event: MessageEvent) => {
        console.log("Main 페이지에서 메시지 수신:", event.data);
        try {
          const data = JSON.parse(event.data);

          // MATCH_FOUND 메시지 처리
          if (data.type === "MATCH_FOUND") {
            console.log("✅ 매칭 성공! MATCH_FOUND 수신");
            console.log("roomId:", data.roomId);

            // roomId 저장
            if (data.roomId) {
              setRoomId(data.roomId);
              console.log("저장된 roomId:", data.roomId);
            }

            // 매칭 팝업 표시
            setShowMatchModal(true);
          }
          // GAME_START 메시지 처리 (수락 후 게임 시작)
          else if (data.type === "GAME_START") {
            console.log("🎮 게임 시작! GAME_START 수신");
            console.log("roomId:", data.roomId);
            console.log("questions:", data.questions);

            // 팝업 닫기
            setShowMatchModal(false);
            setIsAccepting(false);

            // 퀴즈 데이터가 있으면 Quiz 페이지로 이동하면서 데이터 전달
            if (data.questions && Array.isArray(data.questions)) {
              const quizData: QuizQuestion[] = data.questions as QuizQuestion[];

              console.log("받은 퀴즈 문제들:", quizData);
              console.log("퀴즈 개수:", quizData.length);

              // Quiz 페이지로 이동하면서 퀴즈 데이터와 roomId 전달
              console.log("Quiz 페이지로 이동 시도...");
              try {
                navigate("/quiz", {
                  state: {
                    questions: quizData,
                    roomId: data.roomId,
                  },
                  replace: false,
                });
                console.log("✅ Quiz 페이지로 이동 완료");
              } catch (error) {
                console.error("❌ Quiz 페이지 이동 실패:", error);
              }
            } else {
              console.warn("퀴즈 데이터가 없습니다.");
              alert("퀴즈 데이터를 받지 못했습니다.");
            }
          }
          // MATCH_ACCEPTED 메시지 처리 (상대방이 수락했을 때)
          else if (data.type === "MATCH_ACCEPTED") {
            console.log("✅ 상대방이 매칭을 수락했습니다.");
            // 상대방 수락 대기 중일 수 있으므로 상태 업데이트
          }
          // MATCH_REJECTED 메시지 처리 (상대방이 거절했을 때)
          else if (data.type === "MATCH_REJECTED") {
            console.log("❌ 상대방이 매칭을 거절했습니다.");
            setShowMatchModal(false);
            setRoomId(null);
            setIsAccepting(false);
            alert("상대방이 매칭을 거절했습니다.");
          } else {
            // 다른 메시지 처리
            console.log("파싱된 데이터:", data);
          }
        } catch (error) {
          console.error("메시지 파싱 오류:", error);
        }
      };

      ws.addEventListener("message", handleMessage);

      return () => {
        ws.removeEventListener("message", handleMessage);
      };
    }
  }, []);

  const handleStartMatching = () => {
    // 웹소켓 연결 확인
    const ws = getWS();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("웹소켓이 연결되지 않았습니다.");
      alert("웹소켓이 연결되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // 매칭 시작 로직
    console.log("매칭 시작!");

    // 웹소켓으로 매칭 참여 요청 전송 (MATCH_JOIN)
    send({
      type: "MATCH_JOIN",
    });

    console.log("📤 [SEND] MATCH_JOIN");
  };

  const handleAcceptMatch = (accept: boolean) => {
    if (!roomId) {
      console.warn("roomId가 없습니다.");
      alert("매칭 정보가 없습니다. 다시 시도해주세요.");
      return;
    }

    const ws = getWS();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("웹소켓이 연결되지 않았습니다.");
      alert("웹소켓이 연결되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (accept) {
      // 수락 처리 중 상태로 변경
      setIsAccepting(true);
      console.log("매칭 수락 처리 중...");
    }

    // MATCH_ACCEPT 메시지 전송
    send({
      type: "MATCH_ACCEPT",
      roomId: roomId,
      accept: accept,
    });

    console.log(`📤 [SEND] MATCH_ACCEPT (accept=${accept}, roomId=${roomId})`);

    if (accept) {
      // 수락 시 팝업은 유지하고 로딩 상태 표시 (GAME_START가 올 때까지)
      console.log("매칭을 수락했습니다. 게임 시작을 기다리는 중...");
    } else {
      // 거절 시 즉시 팝업 닫기 및 상태 초기화
      setShowMatchModal(false);
      setRoomId(null);
      setIsAccepting(false);
      console.log("매칭을 거절했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />

      {/* 매칭 팝업 모달 */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#05b04a]/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 p-8">
              {/* 아이콘 */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-[#05b04a] rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* 제목 */}
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
                매칭 성공! 🎉
              </h2>
              <p className="text-center text-gray-600 mb-8">
                {isAccepting
                  ? "게임 시작을 기다리는 중..."
                  : "상대방과 매칭되었습니다.\n게임을 시작하시겠습니까?"}
              </p>

              {/* 수락 처리 중일 때 로딩 표시 */}
              {isAccepting && (
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* 버튼 그룹 */}
              {!isAccepting && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAcceptMatch(false)}
                    className="flex-1 px-6 py-4 text-lg font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    거절
                  </button>
                  <button
                    onClick={() => handleAcceptMatch(true)}
                    className="flex-1 px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-primary to-[#05b04a] rounded-xl hover:from-[#05b04a] hover:to-primary transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    수락
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* 상단: 게임 규칙 */}
          <div className="w-full bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#05b04a] rounded-xl flex items-center justify-center shadow-md">
                <span className="text-2xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-[#05b04a] bg-clip-text text-transparent">
                게임 규칙
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="group p-5 bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      매칭 시작
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      '매칭 시작' 버튼을 누르면 시니어와 MZ가 1:1 랜덤
                      매칭됩니다. 매칭이 성사되면 바로 퀴즈가 시작됩니다.
                    </p>
                  </div>
                </div>
              </div>
              <div className="group p-5 bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      퀴즈 구성
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      총 5문제, 모두 4지선다 객관식
                    </p>
                  </div>
                </div>
              </div>
              <div className="group p-5 bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      제한 시간
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      각 문제당 10초 안에 선택해야 합니다. 시간 초과 시 오답
                      처리됩니다.
                    </p>
                  </div>
                </div>
              </div>
              <div className="group p-5 bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      점수 룰
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      정답 1개당 +1점. 5문제 종료 후 더 높은 점수를 획득한
                      사람이 승리합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단: 회원 랭킹과 매칭 버튼 */}
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* 왼쪽: 회원 랭킹 */}
            <div className="w-full lg:w-[400px] bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">🏆</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-[#05b04a] bg-clip-text text-transparent">
                  회원 랭킹
                </h2>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
                {rankingData.length > 0 ? (
                  rankingData.map((user) => (
                    <div
                      key={user.rank}
                      className={`group relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                        user.rank <= 3
                          ? "bg-gradient-to-r from-white to-gray-50 shadow-md hover:shadow-lg"
                          : "bg-white hover:bg-gray-50 shadow-sm hover:shadow-md"
                      } border ${
                        user.rank === 1
                          ? "border-yellow-200"
                          : user.rank === 2
                          ? "border-gray-300"
                          : user.rank === 3
                          ? "border-amber-200"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg shadow-sm ${
                            user.rank === 1
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white"
                              : user.rank === 2
                              ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                              : user.rank === 3
                              ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {user.rank}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-gray-800">
                              {user.nickname}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                user.role === "시니어"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-[#05b04a] bg-clip-text text-transparent">
                          {user.score}
                        </span>
                        <span className="text-sm text-gray-500">점</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    랭킹 데이터가 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 매칭 시작 버튼 영역 */}
            <div className="flex-1 flex flex-col items-end justify-center min-h-0">
              <div className="relative w-full max-w-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-[#05b04a]/10 rounded-3xl p-12 border-2 border-primary/20 shadow-2xl overflow-hidden h-full flex items-center justify-center">
                {/* 배경 장식 요소 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#05b04a]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-[#05b04a] rounded-2xl mb-6 shadow-lg">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                    세대를 넘어
                    <br />
                    <span className="bg-gradient-to-r from-primary to-[#05b04a] bg-clip-text text-transparent">
                      함께하는 시간
                    </span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-10">
                    시니어와 MZ가 1대1 퀴즈로 세대 간 간극을 줄이고 친해져요
                  </p>
                  <button
                    onClick={handleStartMatching}
                    className="group relative px-16 py-6 text-2xl font-bold text-white rounded-2xl bg-gradient-to-r from-primary to-[#05b04a] hover:from-[#05b04a] hover:to-primary transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-[0_25px_60px_rgba(5,199,85,0.5)] overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-4">
                      <svg
                        className="w-7 h-7 animate-pulse group-hover:animate-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      매칭 시작하기
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Main;
