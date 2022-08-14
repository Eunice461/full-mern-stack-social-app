const express = require('express');
const app = express();
require('./redis-connect')
require('dotenv').config()
const router = express.Router();

const path = require('path')

//Rest of the packages needed
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const fs = require('fs');
const {uploadCloudinary} = require("./middleware/CloudinaryFunction")


//Router path
const api = require('./routes/api')


//middleware path
//const notFoundMiddleware = require('./middleware/not-found');

//connecting to rateLimiter
app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP. please try again in an hour!'
  })
);

app.use(morgan('combined'));
app.use(helmet())
app.use(xss());
app.use(mongoSanitize());


app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));


//middleware

app.use(cors({
  origin: 'http://localhost:3000',
    method: 'GET,POST.PATCH,DELETE',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
})
);

router.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 
   });

app.use("/images", express.static(path.join(__dirname, "/images") ))


app.get('/', (req, res) => {
  res.send('social media API')
})


//Router connect
app.use('/v1', api)

//app.use(notFoundMiddleware);

module.exports = app;