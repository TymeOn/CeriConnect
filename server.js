import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import https from 'https';
import { User } from './src/models/User.js';
import { UserDAO } from './src/dao/UserDAO.js'
import { PostDB } from './src/PostDB.js'
import crypto from 'crypto';


// GENERAL SETUP
// ---------

dotenv.config();
PostDB.open();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// EXPRESS SETUP
// -------------

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

const frontApp = express();
frontApp.use(express.static(__dirname + '/ConnectCERI/dist/connect-ceri/'))

const options = {
    key: fs.readFileSync('keys/key.pem'),
    cert: fs.readFileSync('keys/cert.pem')
};

const userDAO = new UserDAO();


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
            return res.status(401).json({ message: 'Erreur. Mauvais identifiant ou mot de passe.' });
        }

        const hashedPassword = await userDAO.getHashedPassword(req.body.username);
        if (!hashedPassword) {
            return res.status(401).json({ message: 'Erreur. Mauvais identifiant ou mot de passe.' });
        }

        if (crypto.createHash('sha1').update(req.body.password).digest('hex') == hashedPassword) {
            return res.status(200).json({});
        } else {
            return res.status(401).json({ message: 'Erreur. Mauvais identifiant ou mot de passe.' });
        }
    } catch (err) {
        res.status(500).send({errName: err.name, errMessage: err.message});
    }
});

app.get('/test', async(req, res) => {
    try {
        console.log('OUI');
        return res.status(200).json({});
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
