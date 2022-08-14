const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StorySchema = new Schema({
  user: { 
      type: Schema.Types.ObjectId,
       ref: "User" 
    },
  content: {
      type: String
  },
  storyPhoto:{
        type: String,
        required:false,
    },
    storyPublicId:{
        type: String,
        default: " "
    }, 
    video: {
        type: String
    },
    newStory: {
        type: Boolean,
        default: false
    },
    newDate:{
        type: Date,
   },
   expDate:{
        type: Date,
   },
   currentDate:{
        type: Date,
   },
}, {timestamps: true},

);         

module.exports = mongoose.model("Story", StorySchema);