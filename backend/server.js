const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes');

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(routes);



// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });