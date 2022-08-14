const mongoose = require("mongoose"); //import mongoose to be used
const Schema = mongoose.Schema;
const Post = require('./Post')

const ReplyCommentSchema = new mongoose.Schema(
    {
        replycomment:{
            type: String,
            required: true,
        },
       author:{
            type: Schema.Types.ObjectId, 
            ref: 'User', 
        },
        postId: {
            type: Schema.Types.ObjectId, 
            ref: 'Post',
        },
       
}, {timestamps: true}
);


//exporting this schema
module.exports = mongoose.model("ReplyComment", ReplyCommentSchema); //the module name is "Post"