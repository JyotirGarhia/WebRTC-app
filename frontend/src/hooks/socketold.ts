import { useEffect, useState, useRef } from "react";
import { getSocket } from "../ws/socket";

type SocketStatus = "CONNECTING" | "OPEN" | "CLOSED" | "ERROR";

export const useSocket = (onMessage: (data: any) => void) =>{

    const [status, setStatus] = useState<SocketStatus>("CONNECTING");

    const messageHandlerRef = useRef(onMessage);

    useEffect(() =>{
        messageHandlerRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const socket = getSocket();

        socket.onopen = () => {
            console.log('WS connected');
            setStatus("OPEN");
        };

        socket.onmessage = (event) => {
            messageHandlerRef.current(JSON.parse(event.data));
        }

        socket.onclose = () => {
            console.log('WS disconnected');
            setStatus("CLOSED");
        }

        socket.onerror = () => {
            console.log('WS error');
            setStatus("ERROR");
        }

    },[onMessage]);

    const send = (data: any) => {
        const socket = getSocket();
        socket.send(JSON.stringify(data));
    }

    return { send, status };
}
