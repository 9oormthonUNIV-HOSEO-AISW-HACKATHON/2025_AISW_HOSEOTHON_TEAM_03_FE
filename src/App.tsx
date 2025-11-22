import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Main from "./pages/Main";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import { getWS } from "./utils/websocket";

function App() {
  useEffect(() => {
    // accessToken이 있으면 웹소켓 연결 시도
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      console.log("App 시작: 웹소켓 연결 시도");
      getWS();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
