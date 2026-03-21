import { useEffect, useState, useRef, useCallback } from "react";
import { getSocket } from "../ws/socket";

type SocketStatus = "CONNECTING" | "OPEN" | "CLOSED" | "ERROR";

export const useSocket = (onMessage: (data: any) => void) => {
    const [status, setStatus] = useState<SocketStatus>("CONNECTING");

    const messageHandlerRef = useRef(onMessage);

    useEffect(() => {
        messageHandlerRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const socket = getSocket();

        if (socket.readyState === WebSocket.OPEN) {
            setStatus("OPEN");
        } else if (socket.readyState === WebSocket.CONNECTING) {
            setStatus("CONNECTING");
        }

        socket.onopen = () => {
            console.log('WS connected');
            setStatus("OPEN");
        };

        socket.onclose = () => {
            console.log('WS disconnected');
            setStatus("CLOSED");
        }

        socket.onerror = () => {
            console.log('WS error');
            setStatus("ERROR");
        }


        const handleMessage = (event: MessageEvent) => {
        const parsed = JSON.parse(event.data);
        messageHandlerRef.current(parsed);
        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, []);

    const send = useCallback((data: any) => {
        const socket = getSocket();

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data));
        } else {
            console.warn("WebSocket not open. Current state:", socket.readyState);
        }
    }, []);

    return { send, status };
};