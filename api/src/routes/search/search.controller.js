const Post = require('../../models/Post');
const User = require('../../models/User')

async function httpSearchPost(req, res){
   try{
       
        key = req.body.title;
        if(key){
            const post = await Post.find({title: {$regex: key.toString(), "$options": "i"}})
                return res.status(200).json({post})
        }
        if(key == ""){
             return res.status(404).json("provide your search key words")
        }
        
   }catch(err){
       console.log(err);
       return res.status(404).json("Not found")
   }
   
};

async function httpSearchUser(req, res){
    try{
        
         key = req.body.firstName;
         if(key){
             const user = await User.find({firstName: {$regex: key.toString(), "$options": "i"}})
                 return res.status(200).json({user})
         }
         if(key == ""){
              return res.status(404).json("provide your search key words")
         }
         
    }catch(err){
        console.log(err);
        return res.status(404).json("Not found")
    }
    
 };

module.exports = {
    httpSearchPost,
    httpSearchUser
}