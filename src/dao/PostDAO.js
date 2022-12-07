import dotenv from 'dotenv';
import mongoose from "mongoose";
import {PostDB} from '../PostDB.js';
import {Post} from "../models/Post.js";

dotenv.config();

export class PostDAO {

    Post;

    // constructor, initializes the model for each new instance of PostDAO
    constructor() {
        PostDB.open().then();
        const schema = new mongoose.Schema(Post.getModel());
        this.Post = mongoose.model('Post', schema, process.env.MG_COLLECTION);
    }

    // gets all the posts in the DB
    async getAll() {
        return await this.Post.find();
    }

    // gets a specific post in the DB
    async get(id) {
        return await this.Post.findById(id);
    }

    // adds a new post
    async add(post) {
        const newPost = this.Post(post);
        return await newPost.save();
    }

    // updates a post
    async update(post) {
        return await this.Post.update(post);
    }

    // removes a post
    async remove(postId) {
        return await this.Post.deleteOne({_id: postId});
    }

}
