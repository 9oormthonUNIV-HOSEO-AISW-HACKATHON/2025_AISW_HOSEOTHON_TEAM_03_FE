import { useEffect } from "react";
import { RANKING_DATA } from "../constants/ranking";
import Header from "../components/Header";
import { getWS, send } from "../utils/websocket";
import { useProfile } from "../hooks/user";

function Main() {
  const { data: profile } = useProfile();

  console.log(profile);
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
          // 메시지 처리 로직
          console.log("파싱된 데이터:", data);
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
    // 매칭 시작 로직
    console.log("매칭 시작!");

    // 웹소켓으로 매칭 요청 전송
    send({
      type: "START_MATCHING",
      // 필요한 데이터 추가
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header nickname="닉네임" role="역할" />

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
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* 왼쪽: 회원 랭킹 */}
            <div className="w-full lg:w-[400px] bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">🏆</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-[#05b04a] bg-clip-text text-transparent">
                  회원 랭킹
                </h2>
              </div>
              <div className="space-y-3">
                {RANKING_DATA.map((user) => (
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
                ))}
              </div>
            </div>

            {/* 오른쪽: 매칭 시작 버튼 영역 */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-[#05b04a]/10 rounded-3xl p-12 border-2 border-primary/20 shadow-2xl overflow-hidden">
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
