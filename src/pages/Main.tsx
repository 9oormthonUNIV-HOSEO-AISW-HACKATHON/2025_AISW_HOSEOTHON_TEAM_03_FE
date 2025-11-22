function Main() {
  const handleStartMatching = () => {
    // 매칭 시작 로직
    console.log("매칭 시작!");
  };

  return (
    <div className="min-h-screen bg-[#faf5f0]">
      {/* 헤더 */}
      <header className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">GenOn</h1>
            <nav className="flex items-center gap-6">
              <a
                href="#"
                className="text-[#998c80] hover:text-[#66594d] transition-colors"
              >
                홈
              </a>
              <a
                href="#"
                className="text-[#998c80] hover:text-[#66594d] transition-colors"
              >
                프로필
              </a>
              <a
                href="#"
                className="text-[#998c80] hover:text-[#66594d] transition-colors"
              >
                설정
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              나와 맞는 팀원을 찾아보세요
            </h2>
            <p className="text-xl text-[#998c80]">
              GenOn과 함께 프로젝트의 완벽한 파트너를 만나보세요
            </p>
          </div>

          {/* 매칭 시작 버튼 */}
          <button
            onClick={handleStartMatching}
            className="group relative px-12 py-6 text-xl font-bold text-white rounded-2xl bg-primary hover:bg-[#05b04a] transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl"
          >
            <span className="relative z-10 flex items-center gap-3">
              <svg
                className="w-6 h-6 animate-pulse"
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
          </button>
        </div>
      </main>
    </div>
  );
}

export default Main;
