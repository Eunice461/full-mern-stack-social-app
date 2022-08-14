const express = require('express')

const {
    authenticateUser, authorizeRoles,
  } = require('../../middleware/full-auth');

const { 
    httpCreateStory,
    httpGetAllStory,
    httpGetSingleStory,
    httpRemoveStory
} = require('./story.controller')

const {upload} = require('../../middleware/multer');

const storyRouter = express.Router();

storyRouter.post('/', authenticateUser, upload.single("file"), httpCreateStory );
storyRouter.get('/:id', authenticateUser, httpGetSingleStory);
storyRouter.get('/', authenticateUser, httpGetAllStory);
storyRouter.delete('/:id', authenticateUser, httpCreateStory);

module.exports = storyRouter;