const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid');
const jwt = require('jsonwebtoken')

    const transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SENDGRID_USERNAME,    // your email
          pass: process.env.SENDGRID_PASSWORD,     // email pass, put them in .env file & turn the 'Less secure apps' option 'on' in gmail settings
        },

    // sendgridTransport({
    //     apiKey: process.env.SENDGRID_USERNAME
    // })
    })

const sendEmailVerificationLink = async(user, res) => {
    const emailToken = jwt.sign({userId: user._id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName}, process.env.EMAIL_SECRET, {
        expiresIn: process.env.EMAIL_DURATION
    })

    //const url = `https://demo-api-100.herokuapp.com/v1/verification/${token}`;
    const url = `http://localhost:3000/verification/${emailToken}`;
    //const url = `http://100nft-frontend-nextjs.vercel.app/account/verify/${token}`


    transporter.sendMail({
        from: 'techme115@outlook.com',
        to: `${user.username} <${user.email}>`,
    subject: 'Account verication',
    html: `Hello ${user.username}, please, confirm your Email by clicking this link <a href=${url}> ${url}</a>`
}).then(() =>{
    console.log("Emails was sent")
}).catch((err)=>{
    console.log(err)
    return res.status(500).json(("Email was not sent, please try and resend by clicking the resend button"))
})
    return emailToken
}

const sendForgetPasswordLink = async(user) => {
    const token = jwt.sign({userId: user._id}, process.env.EMAIL_SECRET, {
        expiresIn: process.env.EMAIL_DURATION
    })

    //const url = `https://demo-api-100.herokuapp.com/v1/resetPassword/${token}`;
    const url = `http://localhost:3000/v1/resetPassword/${token}`;
    //const url = `http://100nft-frontend-nextjs.vercel.app/v1/resetPassword/${token}`

    transporter.sendMail({
        from: 'techme115@outlook.com',
        to: `${user.email}`,
        subject: 'Reset Password',
        text: 'Reset your password for React ToDo app.',
        html: `<p>Please click this link to reset password. <a href="${url}">${url}</a></p>`
    }).then(() =>{
        console.log(`Password reset link was sent to ${user.email}.`)
    }).catch((err) => {
        console.log(err);
        console.log('Password reset failed, Email sending failed!');
    })

    return token
}

module.exports = {
    sendEmailVerificationLink,
    sendForgetPasswordLink
}