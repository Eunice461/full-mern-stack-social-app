const Comment = require("../../models/Comment")
const Post = require("../../models/Post");
const User = require('../../models/User')

//creating comment logic

async function httpCreateComment(req, res){
    try{
    const user = await User.findById(req.user.userId);

    if(!user){
         return res.status(500).json('No user found');
    };
    if(user.isBlocked === true){
         return res.status(401).json('Sorry, are banned from making comment at this time');
    };
    if(user.isVerified === false){
        return res.status(401).json('Sorr, are banned from making comment at this time');
    };
    const newComment = new Comment(req.body);
        
    try{
            const currentPost = await Post.findById(req.params.id)
            const findUser = currentPost.user
            const getUser = await User.findById(findUser)
            const currentUser = await User.findById(req.body.author);

            if(getUser.listOfBlockedUser.includes(currentUser._id)){
                 return res.status(401).json('Sorry, you are blocked from commenting on this post')
            }

            if(!currentPost || !currentUser){
                return res.status(500).json('No post or user found');
            }

            currentPost.comments.push(newComment);//we need to push the comment into the post
            currentUser.usercomments.push(newComment);

            const saveNewComment = await newComment.save({
                postId: currentPost._id
            });
            await currentPost.save()
            await currentUser.save();
            
       return res.status(200).json(saveNewComment);
    }catch(err){
        return res.status(500).json({ error: "Server Error" + err });
    };
 }catch(err){
    return res.status(500).json({ error: "Server Error" + err });
 }
}

//get comment
async function httpSingleComment(req, res){
     try{
        const user = await User.findById(req.user.userId);

        if(!user){
             return res.status(500).json('No user found');
        };
        const currentPost = await Post.findById(req.params.postId)
        const findUser = currentPost.user
         const getUser = await User.findById(findUser)

         if(getUser.listOfBlockedUser.includes(user._id)){
            return res.status(401).json('Sorry, you are blocked by user from getting this comment')
       }
        const comments = await Comment.findById(req.params.commentId).populate('author', 'profilePicture username').populate("postId").populate({
      path: "replies",
      populate: {
         path: "author",
         select: 'profilePicture username'
      }
   });
        res.status(200).json(comments)
    }catch(err){
        return res.status(500).json({ error: "Server Error" + err });
    }
}


//comment edit/update
async function httpUpdateComment(req, res){
    try{
    const user = await User.findById(req.user.userId);

    if(!user){
         return res.status(500).json('No user, found');
    };
    if(user.isBlocked === true){
         return res.status(401).json('Sorry, you are banned from performing this action at the moment');
    };
    if(user.isVerified === false){
         return res.status(401).json('Sorry, only verified users can update their comment');
    }
    try{
        const currentPost = await Post.findById(req.params.postId)
        const findUser = currentPost.user
         const getUser = await User.findById(findUser)

         if(getUser.listOfBlockedUser.includes(user._id)){
            return res.status(401).json('Cant find comment')
       }
         const comment = await Comment.findById(req.params.commentId);
         
         if(!comment){
             return res.status(401).json(`No comment with the id ${comment} found`)
         }
         console.log(comment.author === req.body.author)
        if(comment.author.toString() == req.body.author){
            try{
                 const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, {
                        $set: req.body
                    }, {new: true})
                    return res.status(200).json(updatedComment)
            }catch(err){
                return res.status(500).json({ error: "Server Error" + err });
            } 
        }
        else{
                return res.status(401).json("you can only update your comment")
            }
    }catch(err){
        return res.status(500).json({ error: "Server Error" + err });
    }
}catch(err){
    return res.status(500).json({ error: "Server Error" + err });
}
}

//comment delete
async function httpDeleteComment(req, res){
     try{
        const comment = await Comment.findById(req.params.commentId);
        const adminUser = await User.findById(req.user.userId)
        const {id} = req.params;
        const user = await User.findById(comment.author);
        const userId = user._id;

        if(!comment || !id || !user){
            return res.status(200).json("User or Post or comment not found")

        };
        if(comment.author == req.body.author || adminUser.role === 'admin'){
            try{
                await Post.findByIdAndUpdate(userId, { $pull: {usercomments: comment._id } });
                await Post.findByIdAndUpdate(id, { $pull: { comments: comment._id } });
                await Comment.findByIdAndDelete(comment._id);
                return res.status(200).json("Comment has been deleted");
            }catch(err){
                return res.status(500).json({ error: "Server Error" + err });
            }
        }
        else{
            return res.status(401).json("you can only delete your posts");
        };
    }catch(err){
        return res.status(500).json({ error: "Server Error" + err });
    };

};


module.exports = {
    httpCreateComment,
    httpUpdateComment,
    httpSingleComment,
    httpDeleteComment
}