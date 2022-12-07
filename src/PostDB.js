import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export class PostDB {
    static async open() {
        if (PostDB.connection == null) {
            try {
                const mongoUrl = 'mongodb://' +
                    (process.env.MG_USER ? (process.env.MG_USER + ':') : '') +
                    (process.env.MG_PASS ? (process.env.MG_PASS + '@') : '') +
                    process.env.MG_HOST + ':' +
                    process.env.MG_PORT + '/' +
                    process.env.MG_NAME
                ;
                console.log('OUI ', mongoUrl);
                PostDB.connection = await mongoose.connect(mongoUrl);
                console.log("Connected to Mongo DB");
            } catch (err) {
                console.error(err);
                console.error("Exit application...");
                process.exit(-1);
            }
        }
        return PostDB.connection;
    }
}
