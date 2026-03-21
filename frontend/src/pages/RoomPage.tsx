import { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { useNavigate } from "react-router-dom";
import Room from "../components/Room.tsx";
import WaitingApproval from "../components/WaitingApproval.tsx";
import JoinRejected from "../components/JoinRejected.tsx";
import RoomClosed from "../components/RoomClosed.tsx";

type PendingRequest = {
    userId: string;
    name: string;
}

type RoomUIState =
    | "INITIALIZING"
    | "IN_ROOM"
    | "WAITING_APPROVAL"
    | "JOIN_REJECTED"
    | "ROOM_CLOSED"
    | "CONNECTION_LOST";

const RoomPage = () => {
    const name = sessionStorage.getItem("name") || "Anonymous";
    const userId = sessionStorage.getItem("userId");
    const roomId = sessionStorage.getItem("roomId");
    const isHost = sessionStorage.getItem("isHost") === "true";

    const hasInitialized = useRef(false);
    const navigate = useNavigate();

    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [uiState, setUiState] = useState<RoomUIState>("INITIALIZING");

    const { send, status } = useSocket((msg) => {
        switch (msg.type) {
            case "join-request":
                if (!isHost) return;
                setPendingRequests(prev => [
                    ...prev,
                    { userId: msg.userId, name: msg.name }
                ]);
                break;

            case "join-approved":
                setUiState("IN_ROOM");
                console.log("Join approved");
                break;

            case "join-rejected":
                setUiState("JOIN_REJECTED");
                console.log("Join rejected");
                break;

            case "room-closed":
                setUiState("ROOM_CLOSED");
                console.log("Room closed");
                break;

            default:
                console.log("Roompage switch case: Unknown message type:", msg.type);
        }
    });

    useEffect(() => {
        if (status != "OPEN") return;
        if (hasInitialized.current) return;
        if (!roomId || !userId || !name) return;

        hasInitialized.current = true;
        if (!isHost) {
            send({
                type: "join-request",
                roomId: roomId,
                userId: userId,
                name: name
            })
            console.log("join request send");
            setUiState("WAITING_APPROVAL");
        } else {
            send({
                type: "create-room",
                roomId: roomId,
                userId: userId,
                name: name
            })
            setUiState("IN_ROOM");
        }
    }, [status, isHost, roomId, userId, name, send]);

    if (uiState === "INITIALIZING" || status === "CONNECTING") {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Connecting to server...</p>
            </div>
        )
    }

    if (status === "ERROR" || status === "CLOSED") {
        setUiState("CONNECTION_LOST");  //just for the sake of using the uiState nothing else
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p>Connection lost.</p>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => navigate("/")}
                >
                    Return to Home
                </button>
            </div>
        );
    }

    if (uiState === "WAITING_APPROVAL") {
        return <WaitingApproval
            onCancel={() => setUiState("JOIN_REJECTED")}
        />;
    }

    if (uiState === "JOIN_REJECTED") {
        return <JoinRejected />;
    }

    if (uiState === "ROOM_CLOSED") {
        return <RoomClosed />;
    }


    return (
        <Room isHost={isHost}
            pendingRequests={pendingRequests}
            onApprove={(userId) => {
                send({
                    type: "join-response",
                    roomId,
                    userId,
                    approved: true
                })

                setPendingRequests(prev =>
                    prev.filter(req => req.userId !== userId)
                )
            }}

            onReject={(userId) => {
                send({
                    type: "join-response",
                    roomId,
                    userId,
                    approved: false
                })

                setPendingRequests(prev =>
                    prev.filter(req => req.userId !== userId)
                )
            }}

            onEndRoom={() => {
                send({
                    type: "end-room",
                    roomId
                })
            }}
        />
    )
}

export default RoomPage