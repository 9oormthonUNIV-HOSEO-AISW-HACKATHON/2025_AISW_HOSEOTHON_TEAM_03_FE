import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { instance } from "../apis/instance";

function Login() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await instance.post("/v1/auth/login", {
        loginId,
        password,
      });
      console.log("Login 성공:", response.data);

      // accessToken을 localStorage에 저장
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }

      // 로그인 성공 후 메인 페이지로 이동
      navigate("/main");
    } catch (error) {
      console.error("Login 실패:", error);
      // 에러 처리 로직 추가 가능
    }
  };

  return (
    <div className="min-h-screen bg-[#faf5f0] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-12 w-full max-w-md">
        <h1 className="text-4xl font-bold text-primary mb-2 text-center">
          GenOn
        </h1>
        <p className="text-xl text-[#998c80] mb-8 text-center">환영합니다</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="loginId"
              className="block text-sm font-medium text-[#66594d] mb-2"
            >
              아이디
            </label>
            <input
              id="loginId"
              name="loginId"
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="w-full px-4 py-3 bg-[#faf7f5] border border-[#e5d9cc] rounded-lg focus:outline-none focus:border-primary text-[#66594d]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#66594d] mb-2"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-3 bg-[#faf7f5] border border-[#e5d9cc] rounded-lg focus:outline-none focus:border-primary text-[#66594d]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary text-white font-semibold rounded-lg hover:bg-[#05b04a] transition-colors"
          >
            로그인
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#998c80]">
            계정이 없으신가요?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
