const Story = require("../../models/Story");
const User = require("../../models/User");
const client = require('../../redis-connect');
const {getPagination} = require("../../services/query");
const {deleteCloudinary, uploadCloudinary, deleteAllFiles} = require('../../middleware/CloudinaryFunction')

async function httpCreateStory(req, res){
    try {
        const storyExpDate = new Date(Date.now() + 86400000);

//CALCULATE DATE
    const threeDay = new Date(Date.now() + 259200000)
    const sevenDay = new Date(Date.now() +604800000)
    const oneMonth = new Date(Date.now() + 2678400000);
    const sixMonth = new Date(Date.now() +15778476000)

    const user = await User.findById(req.user.userId);
    if(!user){
        return res.status(404).json('User not found'); 
    };
    
    if(user.isBlocked === true){
        return res.status(500).json('Sorry, you can not create story at this moment');
    };
    if(user.isVerified === false){
        return res.status(500).json('Only verified users can perform this action');
    };

   if(req.body.content){
    const word = req.body.content

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
            return res.status(401).json('you are block for Three(3) months for using a prohibit word in your post')

        }else{
            await User.findByIdAndUpdate({_id: getuser._id}, {
                isBlocked: true,
                expDate: sixMonth,
                $inc: { count: 1}
            }, {new: true})
            return res.status(401).json('you are block for six(6) months for using a prohibit word in your post')
        }
    }
   }
    
    const newStory = new Story({
        _id: req.body._id,
        user: req.user.userId,
        storyPhoto: req.body.storyPhoto,
        content: req.body.content,
        newStory: true,
        expDate: storyExpDate
    });

    //push post to userPost array to create user-post relationship
       user.userStory.push(newStory);
       const createdStory = await newStory.save();
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
       const savedStory = await Story.findByIdAndUpdate(createdStory._id, {
        storyPhotoId: result.publicId,
        storyPhoto: result.url,
        new: true
       }, {new: true})   
           return res.status(200).json(savedStory)
       }
    }
    return res.status(200).json(createdStory)
    }catch(err){
        return res.status(500).json({ error: "Server Error" + err });
}
    } catch (err) {
        return res.status(500).json({ error: "Server Error" + err });
    }
}

async function httpGetAllStory(req, res){
        try{
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

            const getStoryByUser = user.followings
            story = await Story.find({user: getStoryByUser}).populate('user', 'user').sort({createdAt:-1})
            if(!story){
                return res.status(200).json([])
            }
         return res.status(200).json(story)
         }catch(err){
             return res.status(500).json({ error: "Server Error" + err });
         };
}

async function httpGetSingleStory(req, res){
    try {
        const user = await User.findById(req.user.userId);
        if(!user){
             return res.status(500).json('No user found');
        };
        const currentPost = await Story.findById(req.params.id)
        const findUser = currentPost.user
         const getUser = await User.findById(findUser)

         if(getUser.listOfBlockedUser.includes(user._id)){
            return res.status(401).json('Sorry, you are blocked by user from getting this post')
       }
   try {
    const story = await Story.findById(req.params.id).populate('user', 'user profilePicture ').populate({
        path: "comments",
        populate: [{
            path: "user",
          
        }, {
          path: "replies",
          populate: "user"
      }],
    }) 
       return res.status(200).json(story);
   } catch (error) {
    return res.status(500).json({ error: "Server Error" + err });
   }  
    } catch (err) {
        return res.status(500).json({ error: "Server Error" + err });
    }
}

async function httpRemoveStory(req, res){
    try {
        const user = await User.findById(req.user.userId);
    if(user.isBlocked === true){
         return res.status(500).json('Sorry, you can not make delete at this moment');
    }; 
    if(user.isVerified === false){
        return res.status(500).json('Sorry, only verified users can delete their posts');
    }   
     try{
        const story = await Story.findById(req.params.id);
         if(!story){
            return res.status(401).json("Post not found");
         }
         if(story.user.toString() == user._id.toString()){
                await Story.findByIdAndDelete(story._id); 
               //delete post image from cloudinary
                await deleteCloudinary(story.storyPhotoId)                  
                    res.status(200).json("storyt has been deleted");
         } else{
             res.status(401).json("you can only delete your story");
         };
    }catch(err){
        return res.status(500).json({ error: "Server Error" + err });
    };
    } catch (err) {
        return res.status(500).json({ error: "Server Error" + err });
    }
}

module.exports = {
    httpCreateStory,
    httpGetAllStory,
    httpGetSingleStory,
    httpRemoveStory
}