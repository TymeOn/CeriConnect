import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import https from 'https';
import exp from 'constants';


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
const options = {
    key: fs.readFileSync('keys/key.pem'),
    cert: fs.readFileSync('keys/cert.pem')
};


// GENERAL ROUTES
// --------------

app.get('/', async(req, res) => {
    res.sendFile(__dirname + '/index.html');
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
https.createServer(options, app).listen(process.env.PORT, () => {
    console.log('ConnectCERI running on port ' + process.env.PORT);
});
