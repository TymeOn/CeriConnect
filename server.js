import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import https from 'https';
import { User } from './src/models/User.js';
import { UserDAO } from './src/dao/UserDAO.js'
import { PostDB } from './src/PostDB.js'
import crypto from 'crypto';
import cors from 'cors';


// GENERAL SETUP
// ---------

dotenv.config();
PostDB.open();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// EXPRESS SETUP
// -------------

const app = express();
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
        collectionName: 'MySession3289',
        mongoUrl: 'mongodb://' +
            process.env.MG_USER + ':' +
            process.env.MG_PASS + '@' +
            process.env.MG_HOST + ':' +
            process.env.MG_PORT + '/' +
            process.env.MG_NAME,
        touchAfter: 24 * 3600,
    })
}));

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
        console.log(crypto.createHash('sha1').update(req.body.password).digest('hex'));
        if (crypto.createHash('sha1').update(req.body.password).digest('hex') === hashedPassword) {
            req.session.user = req.body.username;
            req.session.isLogged = true;
            req.session.lastLogin = new Date();
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
