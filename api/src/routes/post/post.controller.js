const User = require('../../models/User'); 
const Post = require("../../models/Post");
const {getPagination} = require("../../services/query");
const {deleteCloudinary, uploadCloudinary, deleteAllFiles} = require('../../middleware/CloudinaryFunction')
const client = require('../../redis-connect');

//create new post
async function httpCreatePost(req, res){
  try{  
      //CALCULATE DATE
    const threeDay = new Date(Date.now() + 259200000)
    const sevenDay = new Date(Date.now() +604800000)
    const oneMonth = new Date(Date.now() + 2678400000);
    const threeMonth = new Date(Date.now()  + 7889238000)
    const sixMonth = new Date(Date.now() +15778476000)
    
    const user = await User.findById(req.user.userId);
    if(!user){
      return res.status(404).json('User not found'); 
    };
    
    if(user.isBlocked === true){
      return res.status(500).json('Sorry, you can not make a post at this moment');
    };
    if(user.isVerified === false){
      return res.status(500).json('Only verified users can perform this action');
    };
    
    if(req.body.description){
      const word = req.body.description
    
      const newString = word.split(" ")
    
      const range = await client.lrange('badnames', 0, -1)
    
      const string = newString.filter(word => range.includes(word))
      const newWord = string.toString()
    
      if(newWord){
          const getuser = await User.findOne({user: user._id})
          if(user.count === 0){
              await User.findByIdAndUpdate({_id: getuser._id}, {
                  isBlocked: true,
                  expDate: threeDay,
                  $inc: { count: 1}
              }, {new: true})
              return res.status(401).json('you are block for Three(3) Days for using a prohibit word in your post')
          }
    
          else if(user.count === 1){
              await User.findByIdAndUpdate({_id: getuser._id}, {
                  isBlocked: true,
                  expDate: sevenDay,
                  $inc: { count: 1}
              }, {new: true})
              return res.status(401).json('you are block for seven(7) Days for using a prohibit word in your post')
          }
    
          else if(user.count === 2){
              await User.findByIdAndUpdate({_id: getuser._id}, {
                  isBlocked: true,
                  expDate: oneMonth,
                  $inc: { count: 1}
              }, {new: true})
              return res.status(401).json('you are block for one(1) months for using a prohibit word in your post')
    
          }
          else if(user.count === 3){
              await User.findByIdAndUpdate({_id: getuser._id}, {
                  isBlocked: true,
                  expDate: threeMonth,
                  $inc: { count: 1}
              }, {new: true})
              return res.status(401).json('you are block for three(3) months for using a prohibit word in your post')
    
          }
          else{
              await User.findByIdAndUpdate({_id: getuser._id}, {
                  isBlocked: true,
                  expDate: sixMonth,
                  $inc: { count: 1}
              }, {new: true})
              return res.status(401).json('you are block for six(6) months for using a prohibit word in your post')
          }
      }
    }
    const newPost = new Post({
      _id: req.body._id,
      user: req.user.userId,
      postPhoto: req.body.postPhoto,
      description: req.body.description,
    });
    //push post to userPost array to create user-post relationship
     user.userPosts.push(newPost);
     const createdPost = await newPost.save();
     await user.save();   
     
     //upload image to cloudinary
       try {
        if(req.file){
            const fileStr = req.file.path
            
            if(!fileStr){
              return res.status(500).json( 'No image found');
            }else{
            //calling the cloudinary function for upload
            const uploadResponse = await uploadCloudinary(fileStr)
              
            const result = {
            url: uploadResponse.secure_url,
            publicId: uploadResponse.public_id
            }
            const savedPost = await Post.findByIdAndUpdate(createdPost._id, {
            photoPublicId: result.publicId,
            postPhoto: result.url
            }, {new: true})   
              return res.status(200).json(savedPost)
            }
            }
            return res.status(200).json(createdPost)
        }catch(err){
            return res.status(500).json({ error: "Server Error" + err });
    }
  }catch(err){
           return res.status(500).json({ error: "Server Error" + err });
  }
};

//GET ALL Users Posts logic
async function httpGetAllPost(req, res){
    const {skip, limit} = getPagination(req.query);
    const users = req.query.user;
    const {searches} = req.query;
    const keys = [req.body.title]

    try {
        const user = await User.findById(req.user.userId);
        if(!user){
             return res.status(404).json('No user found');
        };
        try{
            let posts;
            if(users){
                if(!users.followings.includes(user._id.toString())){
                posts = await Post.find({user: users}).populate('user', 'username profilePicture').sort({createdAt:-1})
                .skip(skip)
                .limit(limit)  
            }
        }
     
            else if(searches){
                posts = await Post.find({title: {$regex: searches.toString(), "$options": "i"}}).populate('user', 'user').sort({createdAt:-1})
                .skip(skip)
                .limit(limit)  
                    
            }
     
            else{ 
                const getPostByUser = user.followings
                posts = await Post.find({user: getPostByUser}).populate('user', 'username profilePicture').sort({createdAt:-1})
                .skip(skip)
                .limit(limit)  
            }
     
         res.status(200).json(posts)
         }catch(err){
             return res.status(500).json({ error: "Server Error" + err });
         };
    } catch (err) {
        return res.status(500).json({ error: "Server Error" + err });
    }
};
async function httpGetUserPost(req, res){
    try {
        const user = await User.findOne({ username: req.params.username });
        console.log(user);
        if(!user){
            return res.status(404).json('no user found')
        }
    const posts = await Post.find({ user: user }).populate('user', 'username profilePicture');
   return res.status(200).json(posts);
    } catch (err) {
        return res.status(500).json({ error: "Server Error" + err });
    }
}
//get timeline posts
async function httpGetTimelinePost(req, res){
	try {
        const user = await User.findById(req.user.userId);
        if(!user){
            return res.json(401).json('No user found')
        };
         if(user.isVerified === false){
            return res.status(500).json('Sorry, only verified users can delete their posts');
        };
		const userPosts = await Post.find({user: user._id}).populate('user', 'username profilePicture'); 
        if(!userPosts){
            return res.status(200).json('you dont have any post')
        }
        const friendPosts = await Promise.all(
            user.followings.map((friendId) => {
                return Post.find({user: friendId}).populate('user', 'username profilePicture'); 
            })
        )
        return res.status(200).json(userPosts.concat(...friendPosts));
	} catch (err) {
		return res.status(500).json({ error: "Server Error" + err });
	}
};

//Get Post
async function httpGetSinglePost(req, res){
    try{
        const user = await User.findById(req.user.userId);
        if(!user){
             return res.status(500).json('No user found');
        };
        const currentPost = await Post.findById(req.params.id)
        const findUser = currentPost.user
         const getUser = await User.findById(findUser)

         if(getUser.listOfBlockedUser.includes(user._id)){
            return res.status(401).json('Sorry, you are blocked by user from getting this post')
       }
   try {
    const post = await Post.findById(req.params.id).populate('user', 'username profilePicture ').populate({
        path: "comments",
        populate: [{
            path: "author",
          
        }, {
          path: "replies",
          populate: "author"
      }],
    }) 
       return res.status(200).json(post);
   } catch (err) {
    return res.status(500).json({ error: "Server Error" + err });
   }
    }catch(err){
        return res.status(500).json({ error: "Server Error" + err });
    }
}

//Update post
async function httpUpdatePost(req, res){
    try{
    const user = await User.findById(req.user.userId);
    if(!user){
         return res.status(404).json("User not found");
    }
    if(user.isBlocked === true){
        return res.status(401).json("Sorry, you're banned from making posts");
    };
    if(user.isVerified === false){
         return res.status(401).json("Sorry, only verified users can update their posts");
    };

    try{
        const post = await Post.findById(req.params.id);
         if(!post){
            return res.status(401).json("No post with this Id found");
            };
        //get the current user profile pics public id for cloudinary delete operations
        const currentPostPhotoPublicId = post.photoPublicId
       
                if(post.user.toString() == user._id.toString() ){
                    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {   
                        $set: req.body
                    }, {new: true, runValidators: true});
                    
                    //update image
                     if(req.file){
                        const fileStr = req.file.path;

                         //calling the cloudinary function for upload
                        const uploadResponse = await uploadCloudinary(fileStr);
                        const result = {
                            url: uploadResponse.secure_url,
                            publicId: uploadResponse.public_id
                            };

                        //push image to upated user
                        const updatePostImage = await Post.findByIdAndUpdate(updatedPost._id, {
                            photoPublicId  : result.publicId,
                            postPhoto: result.url
                        }, {new: true});

                         //get the updated post image public id for cloudinary delete operations
                        const updatedPostImagePublicId = updatePostImage.photoPublicId;
                        //compare the two public ids. If they are not same and the value is not an empty string, the cloudinary delete method would run
                       if(currentPostPhotoPublicId !== "" && currentPostPhotoPublicId !== updatedPostImagePublicId && updatePostImage.photoPublicId !== "" ){
                            await deleteCloudinary(post.photoPublicId)
                       }  
                    }
                   return res.status(200).json(updatedPost);
         } else{
             return res.status(401).json("you can only update your posts");
         }  
    }catch(err){
           return res.status(500).json({ error: "Server Error" + err });
    };
}catch(err){
           return res.status(500).json({ error: "Server Error" + err });
}
};

//like post
async function httpLikePost(req, res){
    try{
        //find user
        const user = await User.findById(req.user.userId);
        if(!user){
            return res.status(404).json('No user found')
        };
        //find post
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json('no post found')
        }
        
        if(!post.postLikes.includes(user._id.toString())){
            //push user id to post like array
            post.postLikes.push(user._id);
            const updatedPost = await post.save()
            const totalLikes = updatedPost.postLikes.length
            console.log( totalLikes)
            return res.status(200).json(totalLikes)
        }else{
            const userIdIndex = post.postLikes.indexOf(user._id);
            //remove user id from post likes array
            post.postLikes.splice(userIdIndex, 1);
            const updatedPost = await post.save()
            const totalLikes = updatedPost.postLikes.length
             console.log(totalLikes)
            return res.status(200).json(totalLikes)
        }
    }catch(err){
        return res.status(500).json({ error: "Server Error" + err });
    }
}

//Delete post
async function httpDeleteSinglePost(req, res){
    try{
    const user = await User.findById(req.user.userId);
    if(user.isBlocked === true){
         return res.status(500).json('Sorry, you can not make delete at this moment');
    }; 
    if(user.isVerified === false){
        return res.status(500).json('Sorry, only verified users can delete their posts');
    }   
     try{
        const post = await Post.findById(req.params.id);
         if(!post){
            return res.status(401).json("Post not found");
         }
         if(post.user.toString() == user._id.toString()){
                await Post.findByIdAndDelete(post._id); 
               //delete post image from cloudinary
                await deleteCloudinary(post.photoPublicId)   
                user.userPosts.pull(post);               
                    res.status(200).json("Post has been deleted");
         } else{
             res.status(401).json("you can only delete your posts");
         };
    }catch(err){
        return res.status(500).json({ error: "Server Error" + err });
    };
  }catch(err){
    return res.status(500).json({ error: "Server Error" + err });
  }
};

//delete all user's posts at once
async function httpDeleteAllPost(req, res){
try{
    const user = await User.findById(req.user.userId);
    if(!user){
        return res.json(401).json('No user found')
    };
    if(user.isVerified === false){
        return res.status(500).json('Sorry, only verified users can delete their posts');
    };
    if(user.isBlocked === true){
         return res.status(500).json('Sorry, you are blocked, you can not perform any action until you are unblocked');
    }; 
    const userId = user._id
    try{
       const posts = await Post.find({user:  userId});
       if(!posts){
           return res.status(404).json('your posts not found')
       }
        //delete all post images associated with this user from cloudinary
        //get the public id object and return as a single array of publicIds
        const arrayOfPostsImagePublicId = posts.map((singleImagePublicId)=>{
            //console.log(singleImagePublicId)
            return singleImagePublicId.photoPublicId
        })
        //pass the array of public image ids to the cloudinary deleteall method
        if(arrayOfPostsImagePublicId){
            await deleteAllFiles(arrayOfPostsImagePublicId, function(result, err){
                if(err){
                    return res.status(500).json('deleting image, failed. Contact admin')
                }
                return result
            })
        }
        //delete all the current user's posts
        await Post.deleteMany({user: user._id})
        return res.status(200).json('All your posts deleted')
    }catch(err){
        return res.status(500).json({ error: "Server Error" + err });
    }
}catch(err){
    return res.status(500).json({ error: "Server Error" + err });
}  
}

//delete selected posts
async function httpDeleteSelectedPost(req, res){
    try{
        const user = await User.findById(req.user.userId);
        const {ids} = req.body
        if(!user){
            return res.status(404).json('user not found');

        };
        //find posts with the ids
        const posts = await Post.find({_id: ids});
        //find the public ids of the found posts
        const arrayOfPostsImagePublicId = posts.map((singleImagePublicId)=>{
            //console.log(singleImagePublicId)
            return singleImagePublicId.photoPublicId
        })

        await deleteAllFiles(arrayOfPostsImagePublicId, function(result, err){
            if(err){
                return res.status(500).json('deleting image, failed. Contact admin')
            }
            return result
        })
            //delete selected posts
                await Post.deleteMany({_id: ids})
                return res.status(200).json('Selected posts deleted')
      
    }catch(err){
        return res.status(500).json({ error: "Server Error" + err });
    }
}

async function httpCreateStory(req, res){
    const user = await User.findById(req.user.userId);
    if(!user){
        return res.json(401).json('No user found')
    };
    if(user.isVerified === false){
        return res.status(500).json('Sorry, only verified users can delete their posts');
    };
    if(user.isBlocked === true){
         return res.status(500).json('Sorry, you are blocked, you can not perform any action until you are unblocked');
    }; 
}


module.exports = {
    httpCreatePost,
    httpDeleteAllPost,
    httpDeleteSelectedPost,
    httpDeleteSinglePost,
    httpGetAllPost,
    httpGetSinglePost,
    httpGetTimelinePost,
    httpLikePost,
    httpUpdatePost,
    httpGetUserPost
   
}
