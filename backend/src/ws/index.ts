import { WebSocketServer } from "ws";
import { handleMessage } from "./handlers.js";
import { allowedOrigins } from "../config/cors.js";
import type { WSWithMeta } from "./types.js";
import type { Server } from "http";

import { cleanupConnection } from "./cleanup.js";

export function initWebSocketServer(server: Server) {
    const wss = new WebSocketServer({ 
        server,
        verifyClient: (info, done) => {
            const origin = info.origin;
    
            if (origin && allowedOrigins.includes(origin)) {
                done(true);
            } else {
                done(false, 403,"Forbidden");
            }
        }
    });

    wss.on('connection', (ws, request) => {
        const metaWs = ws as WSWithMeta;
        console.log('🟢 New WebSocket client connected');

        metaWs.on('message', (data) => handleMessage(metaWs, data));

        metaWs.on('close', () => {
            cleanupConnection(metaWs);
            console.log('🔴 Client disconnected');
        });

        metaWs.on('error', (err) => {
        console.error('❌ WebSocket error:', err);
        });
    });

    return wss
}