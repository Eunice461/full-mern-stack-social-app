const express = require('express')

const {
    authenticateUser, authorizeRoles,
  } = require('../../middleware/full-auth');

const { 
    httpCreateReply,
    httpDeleteReply,
    httpGetSingleReply,
    httpUpdateReply
} = require('./replycomment.controller')

const replyRouter = express.Router();

replyRouter.post("/posts/:postId/comments/:commentId/reply", authenticateUser, httpCreateReply);
replyRouter.get("/posts/:postId/comments/:commentId/:replyId", authenticateUser, httpGetSingleReply);
replyRouter.patch("/posts/:postId/comments/:commentId/:replyId", authenticateUser, httpUpdateReply);
replyRouter.delete("/posts/:id/comments/:commentId/:replyId", authenticateUser, httpDeleteReply)



module.exports = replyRouter;