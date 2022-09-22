import dotenv from 'dotenv';
import { UserDB } from '../UserDB.js';
import { User } from '../models/User.js'
dotenv.config();

export class UserDAO {

    // check if the user exists in the DB
    async getHashedPassword(username) {
        const client = await UserDB.open();
        const query = {
            text: 'SELECT password FROM "' + process.env.SCHEMA + '"."utilisateurs" WHERE username=$1',
            values: [username]
        };
        const result = await client.query(query);
        let data;
        if(result && result.rows && result.rows[0]) {
            data = result.rows[0].password;
        } else {
            data = null;
        }
        return data;
    }

    // get all the users
    async getAll() {
        const client = await UserDB.open();
        const query = {
            text: 'SELECT * FROM "' + process.env.SCHEMA + '"."utilisateurs" ORDER BY id ASC',
        };
        const result = await client.query(query);
        let data = [];
        if(result && result.rows) {
            for (const row of result.rows) {
                const user = new User(
                    row.id,
                    row.identifiant,
                    row.pass,
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

}
