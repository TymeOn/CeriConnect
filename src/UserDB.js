import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export class UserDB {
    static async open() {
        if (UserDB.client == null) {
            try {
                const pool = new pg.Pool({
                    user: process.env.USER,
                    password: process.env.PASSWORD,
                    database: process.env.DB_NAME,
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT
                });
                UserDB.client = await pool.connect();
            } catch (err) {
                console.error(err);
                console.error("Exit application...");
                process.exit(-1);
            }
        }
        return UserDB.client;
    }
}
