const mongoose = require("mongoose"); //import mongoose to be used
const Schema = mongoose.Schema;
const Post = require('./Post');
const ReplyComment = require("./ReplyComment")

const CommentSchema = new mongoose.Schema(
    {
        comment:{
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
         replies:[{
            type: Schema.Types.ObjectId, 
            ref: 'ReplyComment',
        }],
       
}, {timestamps: true}
);
//delets references of replies once a post is deleted.
CommentSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await ReplyComment.deleteMany({
            _id: {
                $in: doc.replies
            }
        })
    }
})


//exporting this schema
module.exports = mongoose.model("Comment", CommentSchema); //the module name is "Post"