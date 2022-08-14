const express = require('express');
const router = express.Router();

const {emailVerify, verifyForgetPassword, resendEmailVerificationLink} = require('../verifyEmail/verifyEmailJwt')

router.post('/confirm/:tokenId', emailVerify)
router.post('/resendlink', resendEmailVerificationLink)
router.patch("/resetPassword/:token", verifyForgetPassword);

module.exports = router
