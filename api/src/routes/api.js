const express = require('express')

const authRouter = require('./auth/auth.route')
const verifyEmail = require('./verifyEmail/emailVerifyRoute')
const userRouter = require('./user/user.route')
const postRouter = require('./post/post.route')
const SearchRouter = require('./search/search.route')
const commentRouter = require('./comment/comment.route')
const replyRouter = require('./replyComment/replycomment.route')
const storyRouter = require('./story/story.route')

const api = express.Router()

api.use('/',verifyEmail )
api.use('/', authRouter)
api.use('/search', SearchRouter)
api.use('/user', userRouter)
api.use('/post', postRouter)
api.use('/comment', commentRouter)
api.use('/reply', replyRouter)
api.use('/story', storyRouter)

module.exports = api;