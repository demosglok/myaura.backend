const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session  = require('express-session');
const cors = require('cors');

const authConfig = require('./config/auth');
const authInit = require('./components/user/auth');
const userComponent = require('./components/user');
const talentComponent = require('./components/talent');
const companyComponent = require('./components/company');
const matchComponent = require('./components/match');
const debug = require('debug')('auramvp:app');

const app = express();

const dbConfig = require('./config/database');

const  mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI || dbConfig.url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on('error', console.error.bind(logger, 'MongoDB connection error:'));


// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({credentials:true, origin:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'someverysecretsecret213453',resave:true, saveUninitialized:true,proxy:false })); // session secret

//app.use('/', indexRouter);
authInit(app, authConfig);
app.use('/user', userComponent);
app.use('/talent', talentComponent);
app.use('/company', companyComponent);
app.use('/match', matchComponent);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    debug(err.status, err.code, err.url, err);
  const statusCode = err.status ? err.status : (err.code ? err.code : null);//not good  
  res.status(statusCode > 0 ? statusCode : 500);
  res.json(err);
});

module.exports = app;
