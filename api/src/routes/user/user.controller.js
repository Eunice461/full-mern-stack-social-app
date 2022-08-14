const User = require('../../models/User');
const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes');
const client = require('../../redis-connect')
const redis_client = require('../../redis-connect');
const { getPagination } = require('../../services/query');
const { deleteImage, uploadCloudinary } = require('../../middleware/CloudinaryFunction');
const { MdAnalytics } = require('react-icons/md');

async function httpGetAllUsers(req, res) {
      const userId = req.query.userId;
      const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
    
}catch(err){
  return res.status(500).json({ error: "Server Error" + err });
}
};

async function httpGetSingleUser(req, res) {
  try{    
    const user = await User.findById(req.user.userId).select('-password');
    if(!user){
         return res.status(404).json("No user found");
    }
    const users = req.params.id
    const getusername = req.query.usernames

    const getUser = users
    ? await User.findById(users).populate('userPosts', 'description')
    : await User.findOne({ username: getusername }).populate('userPosts', 'description');

    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);

}catch(err){
  return res.status(500).json({ error: "Server Error" + err });
};
};

//Code below is to check which user is online
async function httpShowCurrentUser(req, res){
 try {
  res.status(StatusCodes.OK).json({ user: req.user.userId });
 } catch (err) {
  return res.status(500).json({ error: "Server Error" + err });
 }
};
// update user with user.save()
async  function httpUpdateUser(req, res){
    try{ 
       
        const user = await User.findById(req.user.userId);
         
        if(!user){
           return res.status(404).json('No user found'); 
        };
        if(user.isBlocked === true){
            return res.status(401).json('You are banned from updating your profile'); 
        };
        if(user.isVerified === false){
            return res.status(401).json('You are not authorized from updating your profile'); 
        };
       
        if(user._id.toString() === req.params.id){
                    //values that should be updated
               const updatedUser = await User.findByIdAndUpdate(req.params.id,{
                        user: req.user.userId,
                        $set: req.body             
                   }, {new: true}); 
    
                   //get the current user profile pics public id for cloudinary delete operations
                    const currentUserPhotoPublicId = updatedUser.photoPublicId
                    
                //upload image to cloudnary if user uploaded an image
                
                if(req.file){
                    const fileStr = req.file.path
                    //calling the cloudinary function for upload
                    const uploadResponse = await uploadCloudinary(fileStr);
                    const result = {
                        url: uploadResponse.secure_url,
                        publicId: uploadResponse.public_id
                        }
                    //push image to upated user
                    const updateUserProfilePics = await User.findByIdAndUpdate(updatedUser._id, {
                             photoPublicId: result.publicId,
                             profilePicture: result.url
                        }, {new: true}) 
                    //get the updated user profile pics public id for cloudinary delete operations
                    const updatedUserPhotoPublicId = updateUserProfilePics.photoPublicId;
    
                     //compare the two public ids. If they are not same and the value is not an empty string, the cloudinary delete method would run
                    if(currentUserPhotoPublicId !== "" && currentUserPhotoPublicId !== updatedUserPhotoPublicId && updateUserProfilePics.photoPublicId !== " "){
                        console.log('I ran here')
                        await deleteCloudinary(resUser.photoPublicId)
                    }  
                }
               //generate new access and refresh tokens since user updated their profile.
               const token = resUser.JWTAccessToken();
               const refreshToken = resUser.JWTRefreshToken()
               
                //set the new refresh token in redis database
                 await client.set(updatedUser._id.toString(), (refreshToken));
                    //set a new cookie with the new refresh token
                    res.cookie('refreshJWT',  refreshToken, {
                    httpOnly: true,
                    maxAge: 604800000,
                } )
                 
                return res.status(200).json({token});
                
       } else{
           return res.status(401).json("You can only update your account!")
       };
    }catch(err){
      return res.status(500).json({ error: "Server Error" + err });
    };
      
    };

// this code below is to change password
async function httpUpdateUserPassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Please provide both values',
    })
  }
  // checking if that user exist
  const id = req.user.userId
  const user = await User.findOne({ _id: id });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Invalid Credentials, Incorrect Password',
    })
  }
  user.password = newPassword;

  await user.save();
  return res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server Error" + err });
  }
};

//delete user
async function httpDeleteUser(req, res){
  try{
        const user = await User.findById(req.user.userId);
        if(!user){
            return res.status(401).json('No user found')
        }
      if(user._id.toString() === req.params.id){
  
                  //get refresh token of user saved in redis
                  const key = await client.get(user._id.toString());
                  if(!key){
                          await User.findByIdAndDelete(req.params.id);
                          return res.status(200).json("Key not found in database, User has been deleted");    
                  };
                         
                  //check for user's cookie
                  const cookies = req.cookies;
                      if(!cookies?.refreshToken){
                          await User.findByIdAndDelete(req.params.id)
                          return res.status(200).json("No cookie found, user has been deleted");
                      };
                         //clear cookie and redis database of deleted user                         
                          res.clearCookie('refreshToken', {httpOnly: true});
                          await User.findByIdAndDelete(req.params.id)
                          await client.del(user._id.toString());
                          //delete user's pics from cloudinary
                          if(user.photoPublicId !== ''){
                          await deleteImage(user.photoPublicId)
                          }
                          
                          return res.status(200).json("User has been deleted");                                 
     } else{
        return res.status(401).json("You can only delete your account!");
     };
  }catch(err){
    return res.status(500).json({ error: "Server Error" + err });
  }
  };

  async function httpFollowUser(req, res){
	if (req.user.userId !== req.params.id) {
		try {
			const user = await User.findById(req.params.id);
      if(!user){
        return res.status(404).json('user does not exist')
      }
			const currentUser = await User.findById(req.user.userId);
      if(!currentUser){
        return res.status(404).json('no current user')
      }
			if (!user.followers.includes(req.user.userId)) {
				await user.updateOne({ $push: { followers: req.user.userId } });
				await currentUser.updateOne({ $push: { followings: req.params.id } });
				res.status(200).json("user has been followed");
			} else {
				res.status(403).json("you allready follow this user");
			}
		} catch (err) {
			return res.status(500).json({ error: "Server Error" + err });
		}
	} else {
		res.status(403).json("you cant follow yourself");
	}
};

//unfollow a user

async function httpUnfollowUser(req, res){
	if (req.user.userId !== req.params.id) {
		try {
      const user = await User.findById(req.params.id);
      if(!user){
        return res.status(404).json('user does not exist')
      }
			const currentUser = await User.findById(req.user.userId);
      if(!currentUser){
        return res.status(404).json('no current user')
      }
			if (user.followers.includes(req.user.userId)) {
				await user.updateOne({ $pull: { followers: req.user.userId } });
				await currentUser.updateOne({ $pull: { followings: req.params.id } });
				res.status(200).json("user has been unfollowed");
			} else {
				res.status(403).json("you dont follow this user");
			}
		} catch (err) {
			return res.status(500).json({ error: "Server Error" + err });
		}
	} else {
		res.status(403).json("you cant unfollow yourself");
	}
};

async function httpBlockUser(req, res){
    try{
        const userToBlock = await User.findById(req.params.userId);
        const user = await User.findOne({_id: req.user.userId});
        
        if(!userToBlock || !user){
            return res.status(404).json("User not found")
        };

        if(userToBlock.isBlocked == true){
            return res.status(500).json("User has already been blocked")
        };
    if(userToBlock._id.toString() === req.params.userId){
               user.listOfBlockedUser.push(userToBlock._id);
               
               if(userToBlock.followers.includes(user._id.toString())){
                userToBlock.followers.pull(user._id.toString())
               }
               if(userToBlock.followings.includes(user._id.toString())){
                userToBlock.followings.pull(user._id.toString())
               }
               await user.save(); 
               await userToBlock.save();
                
         return res.status(200).json('you successful block this user');
    }else{
         return res.status(401).json('Action can not be completed due to unathourized access or user not found');
    };
    }catch(err){
      return res.status(500).json({ error: "Server Error" + err });
    }
        
    
};

//unblock user
async function httpUnblockUser(req, res){
    try {
      const userToUnblock = await User.findById(req.params.userId);
    const user = await User.findOne({_id: req.user.userId});

    if(!userToUnblock || !user){
        return res.status(404).json("User not found");         
    };

    if(userToUnblock._id.toString() === req.params.userId){
        user.listOfBlockedUser.pull(userToUnblock._id);
        if(user.followings.includes(userToUnblock._id)){
          if(!userToUnblock.followers.includes(user._id.toString())){
            userToUnblock.followers.push(user._id.toString())
           }
        }
        if(user.followers.includes(userToUnblock._id)){
          if(!userToUnblock.followings.includes(user._id.toString())){
            userToUnblock.followings.push(user._id.toString())
           }
        }
        await user.save();  
        await userToUnblock.save()
         return res.status(200).json('you successfully unblock this user');
    }else{
         return res.status(401).json('Action can not be completed due to unathourized access or user not found');
    };
    } catch (error) {
      return res.status(500).json({ error: "Server Error" + err });
    }
};

async function httpGetFriends(req, res){
  try {
    const user = await User.findById(req.user.userId)
    if(!user){
      return res.status(404).json("no user found")
    }
    const followings = await Promise.all( user.followings.map((friendId) => {
      return User.findById(friendId)
    }))
    let friendList = []
    followings.map((friend) => {
      const {_id, username, profilePicture} = friend
      friendList.push({_id, username, profilePicture})
    })
    return res.status(200).json(friendList)
  } catch (err) {
    return res.status(500).json({ error: "Server Error" + err });
  }
}


module.exports = {
  httpGetAllUsers,
  httpGetSingleUser,
  httpShowCurrentUser,
  httpUpdateUser,
  httpUpdateUserPassword,
  httpDeleteUser,
  httpUnfollowUser,
  httpFollowUser,
  httpBlockUser,
  httpUnblockUser,
  httpGetFriends
};
