const cron = require('node-cron');
const Story = require('../models/Story');
const User = require('../models/User');



const autoUpdateDatabase = async () =>{
    cron.schedule('* * * * *', async ()=>{
         
        userToUpate = await User.find({isBlocked: true});  
            try{
                 userToUpate.map(async (single)  =>{
                         await User.updateMany({_id: single._id}, { $currentDate: {currentDate: true}}, {new: true});
                         console.log('Current date updated')
                    
                    if(single.expDate <= single.currentDate && single.isBlocked === true){
                        await User.updateMany({_id: single._id}, {
                            isBlocked: false,
                            expDate: null
                        }, {new: true});
                        return console.log('Update carried out');
                    }
                    
                });
            
            }catch(err){
                console.log(err);
            };
        return console.log('Nothing to update');
    });
   
};

const autoUpdateStoryDatabase = async () =>{
    cron.schedule('* * * * *', async ()=>{
         
        storyToUpate = await Story.find({newStory: true});  
            try{
                storyToUpate.map(async (single)  =>{
                         await Story.updateMany({_id: single._id}, { $currentDate: {currentDate: true}}, {new: true});
                         console.log('Current date updated')
                    
                    if(single.expDate <= single.currentDate && single.newStory === true){
                        await Story.deleteMany({_id: single._id});
                        return console.log('Update carried out');
                    }
                    
                });
            
            }catch(err){
                console.log(err);
            };
        return console.log('Nothing to update');
    });
   
};

autoUpdateDatabase();
autoUpdateStoryDatabase()


module.exports = {
    autoUpdateDatabase,
    autoUpdateStoryDatabase
}