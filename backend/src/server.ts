import app from "./app";

// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 3001;

let server = app.listen(PORT, () => { console.log(`Server listening on port: ${PORT}`) });

export default server;