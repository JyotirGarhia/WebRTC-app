import http from "http"
import app from "./app.js"
import dotenv from "dotenv"
import { initWebSocketServer } from "./ws/index.js"

dotenv.config();

const httpServer = http.createServer(app);

initWebSocketServer(httpServer);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
});

