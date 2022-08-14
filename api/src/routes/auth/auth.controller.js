const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User')
const client = require('../../redis-connect')
const { createTokenUser,}  = require('../../services');
const { sendEmailVerificationLink, sendForgetPasswordLink } = require('../verifyEmail/emailService');

async function register(req, res){
  try {
      const password = req.body.password
      const confirmPassword = req.body.confirmPassword
      const email = req.body.email

    if (password !== confirmPassword){
      return res.status(404).json('Password does not match')
    }

  const emailAlreadyExists = await User.findOne({email: email});
  if (emailAlreadyExists) {
    return res.status(401).json('Email already exists')
  }

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: password,
    confirmPassword: confirmPassword,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  })
  const user = await newUser.save()
  //await sendEmailVerificationLink(user)
  const emailToken = await sendEmailVerificationLink(user, res)
  await client.set(user._id.toString(), emailToken)

  return res.status(200).json({id: user._id, emailToken})
  } catch (err) {
    return res.status(500).json({ error: "Server Error" + err });
  }
}

async function login(req, res){
   try {
    const { email, password } = req.body;
    let isPasswordCorrect

    const reUser = await User.findOne({email: req.body.email});

    if (reUser) {
      isPasswordCorrect = await reUser.comparePassword(req.body.password);
    }

    if(!reUser || !isPasswordCorrect){
      return res.status(401).json("Wrong credentials");
    }
    
    if (reUser.isVerified == false) {
      return res.status(401).json("Your account is yet to be verified");
    }else{
      const user = {
        _id: reUser._id,
        email: reUser.email,
        profilepicture:reUser.profilePicture,
        role: reUser.role,
      }
      const sessionId = crypto.randomBytes(12).toString('hex');  
               
            //generate access token
            const token = reUser.JWTAccessToken()
            //generate refresh token
            const refreshToken = reUser.JWTRefreshToken()
              //set refresh token in redis database

              await client.set(user._id.toString(), (refreshToken));

                res.cookie('refreshJWT', refreshToken, {
                httpOnly: true,
                maxAge: 604800000,
            } )
            return res.status(200).json({token})
        } 
    } catch(err) {
        console.log(err)
        return res.status(500).json({ error: "Server Error" + err });
    }
}

async function logout(req, res){
  //On the client side also delete accessToken
  try{
    const cookies = req.cookies;
   if(!cookies?.refreshJWT){
       return res.status(200).json("No content found");
   };
   console.log(req.user)
   const user = await User.findById(req.user.userId);
   //console.log(user)
   const refreshToken = cookies.refreshJWT; 
   if(!user){
       res.clearCookie('refreshJWT', {httpOnly: true});
       return res.status(200).json({message:"No user found, cleared"});
   };
   //check for user and refreshToken in redis db 
   const key = await client.get(user._id.toString());
   if(key !== refreshToken){
       res.clearCookie('refreshJWT', {httpOnly: true});//add secure true in production
       return res.status(200).json({message : "unmatched key, cleared"});
   }
   //delete from redis db and clear cookie
   await client.del(user._id.toString());
   res.clearCookie('refreshJWT', {httpOnly: true});//add secure true in production
   return res.status(200).json({message : "Logged Out successfully"});
	} catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server Error" + err });
  }
}
  
module.exports = {
    register,
    login,
    logout,
}