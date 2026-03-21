let socket: WebSocket | null = null;

const WS_URL = import.meta.env.VITE_WS_URL;

export function getSocket() {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
        socket = new WebSocket(WS_URL);
    }
    return socket;
}