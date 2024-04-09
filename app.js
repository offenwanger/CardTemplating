import express from 'express';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
(console).log("************* Starting the server *************")
const port = 3333;
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Everything in the local folder can be accessed via /filename
app.use('/', express.static(__dirname + '/'));

// Start the application
app.listen(port);
