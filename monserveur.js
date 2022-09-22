import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import https from 'https';


// GENERAL SETUP
// -------------

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// EXPRESS SETUP
// -------------

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

const frontApp = express();
frontApp.use(express.static(__dirname + '/ConnectCERI/dist/connect-ceri/'))

const options = {
    key: fs.readFileSync('keys/key.pem'),
    cert: fs.readFileSync('keys/cert.pem')
};


// FRONT ROUTE
// -----------

frontApp.get('/', async(req, res) => {
    res.sendFile(__dirname + '/ConnectCERI/dist/connect-ceri/index.html');
});


// USER OPERATIONS
// ---------------

app.post('/login', async(req, res) => {
    try {
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({ message: 'Error. Please enter the correct username and password' })
        } else {
            console.log('Login with username: ' + req.body.username + ' and password: ' + req.body.password);
            res.redirect('/');
        }
    } catch (err) {
        res.status(500).send({errName: err.name, errMessage: err.message});
    }
});


// STARTUP
// -------
https.createServer(options, app).listen(process.env.BACK_PORT, () => {
    console.log('ConnectCERI Back running on port ' + process.env.BACK_PORT);
});

https.createServer(options, frontApp).listen(process.env.FRONT_PORT, () => {
    console.log('ConnectCERI Front running on port ' + process.env.FRONT_PORT);
});
