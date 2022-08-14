const express = require('express');
const userRouter = express.Router();
const {
  authenticateUser,
} = require('../../middleware/full-auth');
const { upload } = require('../../middleware/multer');
const {
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
} = require('./user.controller');

userRouter.get('/', authenticateUser, httpGetAllUsers)
userRouter.get('/showme', authenticateUser, httpShowCurrentUser )
userRouter.patch('/updateUser/:id', authenticateUser, upload.single("file"), httpUpdateUser)
userRouter.patch('/updatePassword',authenticateUser, httpUpdateUserPassword )
userRouter.get('/', authenticateUser, httpGetSingleUser )
userRouter.delete('/deleteMe/:id', authenticateUser, httpDeleteUser)
userRouter.patch('/:id/follow', authenticateUser, httpFollowUser)
userRouter.patch('/:id/unfollow', authenticateUser, httpUnfollowUser)
userRouter.patch("/:userId/block", authenticateUser, httpBlockUser);
userRouter.patch("/:userId/unblock", authenticateUser,httpUnblockUser);
userRouter.get("/get/friends", authenticateUser, httpGetFriends)

module.exports = userRouter;