import WebSocket, { WebSocketServer } from 'ws';
import app from "./app";

// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 3001;

let server = app.listen(PORT, () => { console.log(`Server listening on port: ${PORT}`) });

const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
    console.log("WebSocket connection established");

    ws.on('message', (data) => {
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
            }
        })
    })

    ws.on("close", () => {
        console.log("WebSocket connection closed");
    });
});

export default server;