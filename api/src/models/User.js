const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Story = require("./Story");

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			require: true,
			min: 3,
			max: 20,
		},
		firstName: {
			type: String,
			required: [true, 'Please provide name'],
			minlength: 3,
			maxlength: 50,
			trim: true
		  },
		lastName: {
			type: String,
			required: [true, 'Please provide name'],
			minlength: 3,
			maxlength: 50,
			trim: true
		  },
		email: {
			type: String,
			unique: true,
			required: [true, 'Please provide email'],
			validate: {
			  validator: validator.isEmail,
			  message: 'Please provide valid email',
			},
		  },
		password: {
			type: String,
			required: true,
			min: 6,
		},
		confirmPassword: {
			type: String,
			required: [true, 'Please provide password'],
			minlength: 6,
		  },
		profilePicture: {
			type: String,
			default: "",
		},
		coverPicture: {
			type: String,
			default: "",
		},
		photoPublicId:{
            type: String,
            default: ""
        },
		followers: {
			type: Array,
			default: [],
		},
		followings: {
			type: Array,
			default: [],
		},
		newMessagePopup: {
			 type: Boolean, 
			 default: true 
			},

    	unreadMessage: {
			 type: Boolean, 
			 default: false 
			},

    	unreadNotification: {
			 type: Boolean,
			  default: false 
			},
		role: {
			type: String,
			enum: ['admin', 'user'],
			default: 'user',
			  },
		desc: {
			type: String,
			max: 50,
		},
		city: {
			type: String,
			max: 50,
		},
		from: {
			type: String,
			max: 50,
		},
		relationship: {
			type: Number,
			enum: [1, 2, 3],
		},
		userPosts: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post',
		  }],
		userStory:  [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Story',
		  }],
	   usercomments: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment',
		  }],
	   userReplyComments: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'ReplyComment',
		  }],
		userLikes: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Likes',
		  }],
	   isBlocked: {
	   		type: Boolean,
	   		default: false
		},
		count: {
			type: Number,
			default: 0,
		},
	   blockedDate:{
			type: Date,
	   },
	   expDate:{
			type: Date,
	   },
	   currentDate:{
			type: Date,
	   },
	   isVerified:{
			type: Boolean,
			default: false
	},
	listOfBlockedUser: {
		type: Array,
        default: []
	}
  
}, {timestamps: true}
);

//delete all posts and comments associated with a deleted user
UserSchema.post('findOneAndDelete', async function (doc) {
   if (doc) {
	   await Post.deleteMany({
		   _id: {
			   $in: doc.userPosts
		   }
	   }),
	   await Story.deleteMany({
		_id: {
			$in: doc.userStory
		}
	}),
	   await Comment.deleteMany({
		   _id: {
			   $in: doc.usercomments
		   }
	   }),
	   await ReplyComment.deleteMany({
		   _id: {
			   $in: doc.userReplyCOmments
		   }
	   })
   }
});

UserSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000; // subtracting 1 second takes into account delay in saving into database so that its before the token is generated
    next();
  });
  

  UserSchema.pre('save', async function () {
    // console.log(this.modifiedPaths());
    // console.log(this.isModified('name'));
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, salt)
  });
  
  UserSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password);
    return isMatch;
  };

  UserSchema.methods.JWTAccessToken = function (){
    return jwt.sign({userId: this._id, email: this.email, username:this.username, role: this.role,  profilepicture: this.profilePicture,  photoPublicId: this.photoPublicId, isVerified: this.isVerified, firstName: this.firstName, lastName: this.lastName
    },  
        process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME})
};
//creating the jwt refreshToken using the mongoose instance method
UserSchema.methods.JWTRefreshToken = function (){
    return jwt.sign({userId: this._id, },  
        process.env.REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_DURATION})
};


module.exports = mongoose.model("User", UserSchema);
