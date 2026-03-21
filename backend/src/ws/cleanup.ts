import { rooms } from "./rooms.js";
import type { WSWithMeta } from "./types.js";

export function cleanupConnection(ws: WSWithMeta) {
    const { roomId, userId } = ws;

    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    if (ws !== room.host) {
        
        room.participants.delete(ws);

        if (userId) {
            room.pending.delete(userId);
        }

        for (const participant of room.participants) {
            participant.send(JSON.stringify({
                type: "user-left",
                userId
            }));
        }
        
        console.log(`User ${ws.name} left room ${roomId}`);
        return;
    }

    rooms.delete(roomId);

    for (const participant of room.participants) {
        participant.send(JSON.stringify({
            type: "room-closed"
        }));
        participant.close();
    }

    console.log(`🧹 Cleaned up connection for room ${roomId}`);
}
