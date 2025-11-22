import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { instance } from "../apis/instance";

function SignUp() {
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    nickname: "",
    generationRole: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAgeGroupChange = (role: "SENIOR" | "MZ") => {
    setFormData({
      ...formData,
      generationRole: role,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await instance.post("/v1/members/register", formData);
      console.log("SignUp 성공:", response.data);
      // 회원가입 성공 모달 표시
      setShowSuccessModal(true);
    } catch (error) {
      console.error("SignUp 실패:", error);
      // 에러 처리 로직 추가 가능
    }
  };

  const handleConfirm = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  return (
    <>
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
                htmlFor="loginId"
                className="block text-sm font-medium text-[#66594d] mb-2"
              >
                아이디
              </label>
              <input
                id="loginId"
                name="loginId"
                type="text"
                value={formData.loginId}
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
                  onClick={() => handleAgeGroupChange("SENIOR")}
                  className={`py-3 px-4 rounded-lg border transition-colors ${
                    formData.generationRole === "SENIOR"
                      ? "bg-primary text-white border-primary"
                      : "bg-[#faf7f5] text-[#807366] border-[#e5d9cc]"
                  }`}
                >
                  시니어
                </button>
                <button
                  type="button"
                  onClick={() => handleAgeGroupChange("MZ")}
                  className={`py-3 px-4 rounded-lg border transition-colors ${
                    formData.generationRole === "MZ"
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
              <Link
                to="/"
                className="text-primary font-semibold hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 회원가입 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-[#05b04a] rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                회원가입 성공!
              </h3>
              <p className="text-gray-600 mb-6">
                회원가입이 성공적으로 완료되었습니다.
              </p>
              <button
                onClick={handleConfirm}
                className="w-full py-3 bg-gradient-to-r from-primary to-[#05b04a] text-white font-semibold rounded-lg hover:from-[#05b04a] hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SignUp;
