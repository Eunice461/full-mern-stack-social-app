const mongoose = require("mongoose"); 
const Schema = mongoose.Schema;
const Comment = require("./Comment");
const ReplyComment = require("./ReplyComment");
const User = require('./User')

const PostSchema = new mongoose.Schema(
    {
       
        description:{
            type: String,
            required: false,
        },
        postPhoto:{
            type: String,
            required:false,
        },
        photoPublicId:{
            type: String,
            default: " "
        },
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
       comments: [{
             type: mongoose.Schema.Types.ObjectId,
             ref: 'Comment',
           }],
        postReplyComments: [{
             type: mongoose.Schema.Types.ObjectId,
             ref: 'ReplyComment',
           }],
      postLikes: [
        {
            type:mongoose.Types.ObjectId, 
            ref:'User', 
            default: [],
      }
      ],
        storys: {
            type: Array
        },
}, {timestamps: true},

);
PostSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        }),
        await ReplyComment.deleteMany({
            _id: {
                $in: doc.postReplyComments
            }
        })
        
    }
});


//enables the mongose default search via post title
PostSchema.index({title: 'text'});
//exporting this schema
module.exports = mongoose.model("Post", PostSchema); 