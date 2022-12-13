import dotenv from 'dotenv';
import mongoose, {Schema} from "mongoose";
import {PostDB} from '../PostDB.js';
import {Post} from "../models/Post.js";
import {UserDAO} from "./UserDAO.js";

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
    async getAll(sortId = 0, filterId = 0) {
        let sortOptions = [
            {date: -1, hour: -1},
            {date: 1, hour: 1},
            {likes: -1},
            {likes: 1}
        ];

        let filterOptions = {};
        if (filterId.toString() !== '0') {
            filterOptions = {createdBy: filterId};
        }

        const users = await new UserDAO().getAll();
        const posts = await this.Post.find(filterOptions).sort(sortOptions[sortId]).lean();

        posts.forEach(post => {
            const user = users.filter(u => u.id === post.createdBy);
            post.author = user ? user.map(({username, lastname, firstname, avatar, status}) => ({username, lastname, firstname, avatar, status}))[0] : null;

            post.comments.forEach((comment, index) => {
                if (typeof comment !== 'string' && Object.keys(comment).length > 0) {
                    const user = users.filter(u => u.id === comment.commentedBy);
                    comment.author = user ? user.map(({username, lastname, firstname, avatar, status}) => ({
                        username,
                        lastname,
                        firstname,
                        avatar,
                        status
                    }))[0] : null;
                }
            });
        });

        return posts;
    }

    // gets a specific post in the DB
    async get(id) {
        return await this.Post.findById(id);
    }

    // updates a post
    async update(post) {
        return await this.Post.update(post);
    }

    // removes a post
    async remove(postId) {
        return await this.Post.deleteOne({_id: postId});
    }

    async addLike(postId) {
        return await this.Post.findOneAndUpdate({_id: postId}, {$inc : {'likes' : 1}}).exec();
    }

    async removeLike(postId) {
        return await this.Post.findOneAndUpdate({_id: postId}, {$inc : {'likes' : -1}}).exec();
    }

    // adds a new comment
    async addComment(postId, userId, text) {
        let toRtn = {
            acknowledged: false,
            comment: null
        };
        const post = await this.Post.findById(postId);
        if (post) {
            const today = new Date();
            const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            const hour = today.getHours() + ';' + today.getMinutes();

            const comment = {
                text: text,
                commentedBy: userId,
                date: date,
                hour: hour
            }
            post.comments.push(comment);
            toRtn.comment = comment;

            const updateResult = await this.Post.updateOne({_id: postId}, post);
            toRtn.acknowledged = updateResult.acknowledged;
        }
        return toRtn;
    }

}
