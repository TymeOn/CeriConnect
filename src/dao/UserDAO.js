import dotenv from 'dotenv';
import { UserDB } from '../UserDB.js';
import { User } from '../models/User.js'
dotenv.config();

export class UserDAO {

    // check if the user exists in the DB
    async getHashedPassword(username) {
        const client = await UserDB.open();
        const query = {
            text: 'SELECT id, motpasse FROM "' + process.env.PG_SCHEMA + '"."users" WHERE identifiant=$1',
            values: [username]
        };
        const result = await client.query(query);
        let data;
        if(result && result.rows && result.rows[0]) {
            data = {
                id: result.rows[0].id,
                password: result.rows[0].motpasse
            };
        } else {
            data = null;
        }
        return data;
    }

    // get all the users
    async getAll() {
        const client = await UserDB.open();
        const query = {
            text: 'SELECT * FROM "' + process.env.PG_SCHEMA + '"."users" ORDER BY UPPER(identifiant) ASC',
        };
        const result = await client.query(query);
        let data = [];
        if(result && result.rows) {
            for (const row of result.rows) {
                const user = new User(
                    row.id,
                    row.identifiant,
                    row.motpasse,
                    row.nom,
                    row.prenom,
                    row.birthday,
                    row.status,
                    row.avatar,
                );
                data.push(user);
            }
        } else {
            data = null;
        }
        return data;
    }

    // get all the connected users
    async getConnectedUsers() {
        const client = await UserDB.open();
        const query = {
            text: 'SELECT * FROM "' + process.env.PG_SCHEMA + '"."users" WHERE statut_connexion = 1 ORDER BY UPPER(identifiant) ASC',
        };
        const result = await client.query(query);
        let data = [];
        if(result && result.rows) {
            for (const row of result.rows) {
                const user = new User(
                    row.id,
                    row.identifiant,
                    row.motpasse,
                    row.nom,
                    row.prenom,
                    row.birthday,
                    row.status,
                    row.avatar,
                );
                data.push(user);
            }
        } else {
            data = null;
        }
        return data;
    }

    // sets the status of a user
    async setStatus(userId, status = 0) {
        const client = await UserDB.open();
        const query = {
            text: 'UPDATE "' + process.env.PG_SCHEMA + '"."users" SET statut_connexion=$2 WHERE id=$1 RETURNING *',
            values: [userId, status],
        }
        return await client.query(query);
    }

    // add a new author
    async add() {
        const client = await UserDB.open();
        const query = {
            text: 'INSERT INTO "' + process.env.PG_SCHEMA + '"."users"(identifiant, motpasse, nom, prenom, birthday, status, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            values: ['johnceri', '011493e90bb1523c6f0e708c7fde2963fb84f7d6', 'Smith', 'John', '08/10/2022', 0, 'Avatar'],
        };
        const result = await client.query(query);
        return result;
    }

}
