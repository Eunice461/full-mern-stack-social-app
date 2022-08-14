const express = require('express')

const {
    authenticateUser, authorizeRoles,
  } = require('../../middleware/full-auth');

const { 
    httpCreatePost,
    httpDeleteAllPost,
    httpDeleteSelectedPost,
    httpDeleteSinglePost,
    httpGetAllPost,
    httpGetSinglePost,
    httpGetTimelinePost,
    httpLikePost,
    httpUpdatePost,
    httpGetUserPost,
} = require('./post.controller')

const {upload} = require('../../middleware/multer');

const postRouter = express.Router();

postRouter.post('/', authenticateUser, upload.single("file"), httpCreatePost );
postRouter.patch('/:id', authenticateUser, upload.single("file"), httpUpdatePost);
postRouter.patch('/:id/like', authenticateUser, httpLikePost);
postRouter.delete('/:id', authenticateUser, httpDeleteSinglePost);
postRouter.post('/deleteall', authenticateUser, httpDeleteAllPost);
postRouter.post('/deleteSelected', authenticateUser,httpDeleteSelectedPost)
postRouter.get('/:id', authenticateUser, httpGetSinglePost);
postRouter.get('/', authenticateUser, httpGetAllPost);
postRouter.get('/get/timeline', authenticateUser, httpGetTimelinePost);
postRouter.get('/get/profile/:username', authenticateUser, httpGetUserPost)


module.exports = postRouter;