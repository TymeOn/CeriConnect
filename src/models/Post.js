import {Schema} from "mongoose";

export class Post {
    
    constructor(_date, _hour, _body, _createdBy, _images, _likes, _hashtags, _comments) {
        this.date = _date;
        this.hour = _hour;
        this.body = _body;
        this.createdBy = _createdBy;
        this.images = _images;
        this.likes = _likes;
        this.hashtags = _hashtags;
        this.comments = _comments;
    }

    // getters
    getId() { return this._id; }
    getDate() { return this.date; }
    getHour() { return this.hour; }
    getBody() { return this.body; }
    getCreatedBy() { return this.createdBy; }
    getImages() { return this.images; }
    getLikes() { return this.likes; }
    getHashtags() { return this.hashtags; }
    getComments() { return this.comments; }

    // setters
    setId(_id) { this._id = _id; }
    setDate(_date) { this.date = _date; }
    setHour(_hour) { this.hour = _hour; }
    setBody(_body) { this.body = _body; }
    setCreatedBy(_createdBy) { this.createdBy = _createdBy; }
    setImages(_images) { this.images = _images; }
    setLikes(_likes) { this.likes = _likes; }
    setHashtags(_hashtags) { this.hashtags = _hashtags; }
    setComments(_comments) { this.comments = _comments; }

    static getModel() {

        const comment = new Schema({
            text: String,
            commentedBy: Number,
            date: String,
            hour: String
        }, { _id : false});

        return {
            _id: Number,
            date: String,
            hour: String,
            body: String,
            createdBy: Number,
            images: {
                url: String,
                title: String,
            },
            likes: Number,
            hashtags: [String],
            comments: [comment],
            shared: Number
        }
    }

}
