import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignUp() {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    nickname: "",
    ageGroup: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAgeGroupChange = (ageGroup: string) => {
    setFormData({
      ...formData,
      ageGroup,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 회원가입 로직
    console.log("SignUp:", formData);
    // 회원가입 성공 후 로그인 페이지로 이동
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#faf5f0] flex items-center justify-center py-12">
      <div className="bg-white rounded-2xl shadow-lg p-12 w-full max-w-md">
        <h1 className="text-4xl font-bold text-primary mb-2 text-center">
          GenOn
        </h1>
        <h2 className="text-2xl font-semibold text-[#807366] mb-8 text-center">
          회원가입
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="id"
              className="block text-sm font-medium text-[#66594d] mb-2"
            >
              아이디
            </label>
            <input
              id="id"
              name="id"
              type="text"
              value={formData.id}
              onChange={handleChange}
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
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-3 bg-[#faf7f5] border border-[#e5d9cc] rounded-lg focus:outline-none focus:border-primary text-[#66594d]"
            />
          </div>

          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-[#66594d] mb-2"
            >
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="닉네임을 입력하세요"
              className="w-full px-4 py-3 bg-[#faf7f5] border border-[#e5d9cc] rounded-lg focus:outline-none focus:border-primary text-[#66594d]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#66594d] mb-2">
              연령대 선택
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAgeGroupChange("senior")}
                className={`py-3 px-4 rounded-lg border transition-colors ${
                  formData.ageGroup === "senior"
                    ? "bg-primary text-white border-primary"
                    : "bg-[#faf7f5] text-[#807366] border-[#e5d9cc]"
                }`}
              >
                시니어
              </button>
              <button
                type="button"
                onClick={() => handleAgeGroupChange("mz")}
                className={`py-3 px-4 rounded-lg border transition-colors ${
                  formData.ageGroup === "mz"
                    ? "bg-primary text-white border-primary"
                    : "bg-[#faf7f5] text-[#807366] border-[#e5d9cc]"
                }`}
              >
                MZ
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary text-white font-semibold rounded-lg hover:bg-[#05b04a] transition-colors"
          >
            회원가입
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#998c80]">
            이미 계정이 있으신가요?{" "}
            <Link to="/" className="text-primary font-semibold hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
