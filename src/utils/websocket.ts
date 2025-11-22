let socket: WebSocket | null = null;

/**
 * 웹소켓 인스턴스 가져오기 (싱글톤)
 */
export function getWS(): WebSocket | null {
  if (!socket) {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.warn("accessToken이 없어 웹소켓을 연결할 수 없습니다.");
      return null;
    }

    // 웹소켓 URL 설정
    let wsUrl =
      import.meta.env.VITE_WS_URL ||
      import.meta.env.VITE_API_BASE_URL?.replace(/^http/, "ws") + "/ws" ||
      "ws://localhost:8080/ws";

    // accessToken을 URL에 추가
    wsUrl = `${wsUrl}/quiz?accessToken=${accessToken}`;

    console.log("웹소켓 연결 시도:", wsUrl);

    socket = new WebSocket(wsUrl);

    socket.onopen = () => console.log("웹소켓 연결 성공");

    socket.onmessage = (msg) => {
      console.log("웹소켓 메시지 수신:", msg.data);
    };

    socket.onerror = (error) => console.error("웹소켓 에러:", error);

    socket.onclose = () => {
      console.log("웹소켓 연결 종료");
      socket = null;
    };
  }

  return socket;
}

/**
 * 웹소켓 메시지 전송
 */
export function send(message: unknown): void {
  const ws = getWS();
  if (ws && ws.readyState === WebSocket.OPEN) {
    const data =
      typeof message === "string" ? message : JSON.stringify(message);
    ws.send(data);
  } else {
    console.warn("웹소켓이 연결되지 않았습니다.");
  }
}

export default getWS;
