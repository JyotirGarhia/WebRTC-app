import { WebSocket } from "ws";

export type WSWithMeta = WebSocket & {
    roomId?: string; 
    userId?: string;
    name?: string;
    isHost?: boolean;
};

// Client Message types

type CreateRoomMessage = {
    type: "create-room";
    roomId: string;
    userId: string;
    name: string;
};

type JoinRequestMessage = {
    type: "join-request";
    roomId: string;
    userId: string;
    name: string;
};

type JoinResponseMessage = {
    type: "join-response";
    roomId: string;
    userId: string;
    approved: boolean;
};

type OfferMessage = {
    type: "offer";
    targetUserId: string;
    offer: RTCSessionDescriptionInit;
};

type AnswerMessage = {
    type: "answer";
    targetUserId: string;
    answer: RTCSessionDescriptionInit;
};

type IceCandidateMessage = {
    type: "ice-candidate";
    targetUserId: string;
    candidate: RTCIceCandidateInit;
};

type LeaveRoomMessage = {
    type: "leave-room";
};

type EndRoomMessage = {
    type: "end-room";
};

type ErrorMessage = {
    type: "error";
    data: string;
}

type ScreenShareStartedMessage = {
    type: "screen-share-started";
}

type ScreenShareEndedMessage = {
    type: "screen-share-ended";
}

export type ClientMessage =
    | CreateRoomMessage
    | JoinRequestMessage
    | JoinResponseMessage
    | OfferMessage
    | AnswerMessage
    | IceCandidateMessage
    | LeaveRoomMessage
    | EndRoomMessage
    | ErrorMessage
    | ScreenShareStartedMessage
    | ScreenShareEndedMessage;