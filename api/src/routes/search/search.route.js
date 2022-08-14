const express = require('express')

const {
    authenticateUser,
  } = require('../../middleware/full-auth');


  const SearchRouter = express.Router();
  
  const {httpSearchPost, httpSearchUser} = require('./search.controller')

  SearchRouter.post('/post', authenticateUser, httpSearchPost)
  SearchRouter.post('/user', authenticateUser, httpSearchUser)

  module.exports = SearchRouter