import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import https from 'https';
import { UserDAO } from './src/dao/UserDAO.js';
import {PostDAO} from "./src/dao/PostDAO.js";
import crypto from 'crypto';
import cors from 'cors';
import {Server} from 'socket.io';


// GENERAL SETUP
// ---------

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RESSOURCE_NOT_FOUND = "The requested ressource is not available."



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
            (process.env.MG_USER ? (process.env.MG_USER + ':') : '') +
            (process.env.MG_PASS ? (process.env.MG_PASS + '@') : '') +
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
const postDAO = new PostDAO();



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

        if (crypto.createHash('sha1').update(req.body.password).digest('hex') === hashedPassword.password) {
            await userDAO.setStatus(hashedPassword.id, 1);
            req.session.user = req.body.username;
            req.session.isLogged = true;
            req.session.lastLogin = new Date();
            return res.status(200).json({id: hashedPassword.id});
        } else {
            return res.status(401).json({ message: 'Erreur. Mauvais identifiant ou mot de passe.' });
        }
    } catch (err) {
        res.status(500).send({errName: err.name, errMessage: err.message});
    }
});

app.get('/logout/:userId', async(req, res) => {
    try {
        await userDAO.setStatus(req.params.userId, 0);
        return res.status(200).json();
    } catch (err) {
        res.status(500).send({errName: err.name, errMessage: err.message});
    }
});

app.get('/users', async(req, res) => {
    try {
        return res.status(200).json(await userDAO.getAll());
    } catch (err) {
        res.status(500).send({errName: err.name, errMessage: err.message});
    }
});


// POST OPERATIONS
// ---------------

app.get('/posts', async(req, res) => {
    try {
        return res.status(200).json(await postDAO.getAll());
    } catch (err) {
        res.status(500).send({errName: err.name, errMessage: err.message});
    }
});

app.get('/posts/:sortId/:filterId', async(req, res) => {
    try {
        return res.status(200).json(await postDAO.getAll(req.params.sortId, req.params.filterId));
    } catch (err) {
        res.status(500).send({errName: err.name, errMessage: err.message});
    }
});

app.get('/post-like/:id', async(req, res) => {
    try {
        await postDAO.addLike(req.params.id);
        return res.status(200).json();
    } catch (err) {
        res.status(500).send({errName: err.name, errMessage: err.message});
    }
});

app.get('/post-unlike/:id', async(req, res) => {
    try {
        await postDAO.removeLike(req.params.id);
        return res.status(200).json();
    } catch (err) {
        res.status(500).send({errName: err.name, errMessage: err.message});
    }
});

app.post('/post-share', async(req, res) => {
    try {
        if (!req.body.postId || !req.body.userId || !req.body.body) {
            return res.status(401).json({ message: 'Erreur. Arguments manquants.' });
        }
        return res.status(200).json(await postDAO.sharePost(req.body.postId, req.body.userId, req.body.body, req.body.url, req.body.title, req.body.tags));
    } catch (err) {
        res.status(500).send({errName: err.name, errMessage: err.message});
    }
});



// COMMENT OPERATIONS
// ------------------

app.post('/comments', async(req, res) => {
    try {
        if (!req.body.postId || !req.body.userId || !req.body.text) {
            return res.status(401).json({ message: 'Erreur. Arguments manquants.' });
        }
        return res.status(200).json(await postDAO.addComment(req.body.postId, req.body.userId, req.body.text));
    } catch (err) {
        res.status(500).send({errName: err.name, errMessage: err.message});
    }
});


// STARTUP
// -------

const backServer = https.createServer(options, app).listen(process.env.BACK_PORT, () => {
    console.log('ConnectCERI Back running on port ' + process.env.BACK_PORT);
    setInterval(async() => {
        io.emit('connected-users', await userDAO.getConnectedUsers());
    }, 5000);
});

https.createServer(options, frontApp).listen(process.env.FRONT_PORT, () => {
    console.log('ConnectCERI Front running on port ' + process.env.FRONT_PORT);
});

const io = new Server(backServer, { cors: { origin: '*' } });
