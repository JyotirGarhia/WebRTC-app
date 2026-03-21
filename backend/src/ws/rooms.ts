import type { WebSocket } from "ws";
import type { WSWithMeta } from "./types.js";


export type Room = {
    host: WSWithMeta;
    participants: Set<WSWithMeta>;
    pending: Map<string, WSWithMeta>;
}

export const rooms = new Map<string, Room>();
