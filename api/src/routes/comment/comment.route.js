const express = require('express')

const {
    authenticateUser, authorizeRoles,
  } = require('../../middleware/full-auth');

const { 
    httpCreateComment,
    httpUpdateComment,
    httpSingleComment,
    httpDeleteComment
} = require('./comment.controller')

const commentRouter = express.Router();


commentRouter.post("/posts/:id/comment", authenticateUser, httpCreateComment);
commentRouter.get("/posts/:postId/comment/:commentId", authenticateUser,  httpSingleComment);
commentRouter.patch("/posts/:postId/comment/:commentId", authenticateUser, httpUpdateComment);
commentRouter.delete("/posts/:postId/comment/:commentId", authenticateUser, httpDeleteComment)



module.exports = commentRouter;