import type { RawData } from "ws";
import { rooms } from "./rooms.js";
import type { WSWithMeta, ClientMessage } from "./types.js";



export function handleMessage(ws: WSWithMeta, data: RawData) {
    let message : ClientMessage;

    try {
        message = JSON.parse(data.toString());
    } catch (e) {
        console.warn('❌ Invalid message received from client:', data.toString());
        return;
    }

    switch (message.type) {
        case "create-room": {
            const { roomId, userId, name } = message;

            ws.roomId = roomId;
            ws.userId = userId;
            ws.name = name;
            ws.isHost = true;

            rooms.set(roomId, {
                host: ws,
                participants: new Set([ws]),
                pending: new Map()
            });

            console.log(`User ${name} created room ${roomId}`);
            break;
        }


        case "join-request": {
            const { roomId, userId, name } = message;
            const room = rooms.get(roomId);

            if (!room) {
                ws.send(JSON.stringify({ type: 'room-not-found' }));
                return;
            }

            ws.roomId = roomId;
            ws.userId = userId;
            ws.name = name;

            room.pending.set(userId, ws);

            room.host.send(JSON.stringify({
                type: 'join-request',
                userId,
                name
            }));

            console.log(`User ${name} requested to join room ${roomId}`);
            break;
        }

        case "join-response": {
            const { roomId, userId, approved } = message;
            const room = rooms.get(roomId);

            if (!room) {
                return;
            }

            if(ws !== room.host) {
                console.warn(`User ${ws.name} is not the host of room ${roomId} and tried to send join response`);
                return;
            }

            const participant = room.pending.get(userId);

            if (!participant) {
                return;
            }

            if (approved) {
                room.pending.delete(userId);

                participant.roomId = roomId;
                participant.userId = userId;
                participant.isHost = false;
                participant.send(JSON.stringify({ type: 'join-approved' }));

                for (const existing of room.participants) {
                    existing.send(JSON.stringify({
                        type: "user-connected",
                        userId: participant.userId
                    }));
                }

                room.participants.add(participant);

            } else {
                participant.send(JSON.stringify({ type: 'join-rejected' }));
                room.pending.delete(userId);
                console.log(`User ${userId} rejected to join room ${roomId}`);
            }
            break;
        }

        case "leave-room": {
            ws.close();
            break;
        }

        case "end-room": {
            if (!ws.roomId) return;
            const roomId = ws.roomId;

            const room = rooms.get(roomId);

            if (!room) {
                return;
            }

            if (ws != room.host) {
                return;
            }

            for (const participant of room.participants) {
                participant.send(JSON.stringify({ type: 'room-closed' }));
                participant.close();
            }

            rooms.delete(roomId);
            console.log(`Room ${roomId} closed`);
            break;
        }

        case "offer": {
            const { targetUserId, offer } = message;

            if (!ws.roomId) return;
            const room = rooms.get(ws.roomId);

            if (!room) return;

            let targetSocket: WSWithMeta | undefined;

            for (const participant of room.participants) {
                if (participant.userId === targetUserId) {
                    targetSocket = participant;
                    break;
                }
            }

            if (!targetSocket) return;

            targetSocket.send(JSON.stringify({
                type: "offer",
                fromUserId: ws.userId,
                offer
            }));

            break;

        }

        case "answer": {
            const { targetUserId, answer } = message;

            if (!ws.roomId) return;
            const room = rooms.get(ws.roomId);

            if (!room) return;

            let targetSocket: WSWithMeta | undefined;

            for (const participant of room.participants) {
                if (participant.userId === targetUserId) {
                    targetSocket = participant;
                    break;
                }
            }

            if (!targetSocket) return;

            targetSocket.send(JSON.stringify({
                type: "answer",
                fromUserId: ws.userId,
                answer
            }));

            break;
        }

        case "ice-candidate": {
            const { targetUserId, candidate } = message;

            if (!ws.roomId) return;
            const room = rooms.get(ws.roomId);

            if (!room) return;

            const recipient =  [...room.participants]
                .find(p => p.userId === targetUserId);
         

            if (!recipient){
                console.warn(`ICE target user ${targetUserId} not found`);
                return;   
            } 

            recipient.send(JSON.stringify({
                type: "ice-candidate",
                fromUserId: ws.userId,
                candidate
            }));

            break;
        }

        case "screen-share-started": {
            const userId = ws.userId;

            if (!ws.roomId) return;
            const room = rooms.get(ws.roomId);

            if (!room) return;

            room.participants.forEach(participant => {
                if (participant.userId === userId) return;
                participant.send(JSON.stringify({
                    type: "screen-share-started",
                    userId
                }))
            });
            console.log("screen sharing started from", ws.name);
            break;
        }

        case "screen-share-ended": {
            const userId = ws.userId;
            if (!ws.roomId) return;
            const room = rooms.get(ws.roomId);

            if (!room) return;

            room.participants.forEach(participant => {
                if (participant.userId === userId) return;
                participant.send(JSON.stringify({
                    type: "screen-share-ended",
                    userId
                }))
            });
            console.log("screen sharing ended from", ws.name);
            break;
        }


        case 'error':
            console.error('❌ Error received from client:', message.data);
            break;


        default:
            console.warn('❌ Unknown message type:');
            break;
    }
}