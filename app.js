require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// require database configuration
require('./configs/db.config');

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

function authenticated (req, res, next){
    if (req.session.loggedUser){
      return next();
    }
    res.redirect('/');
  }
  
  
  //Session
  const session = require('express-session');
  const MongoStore = require('connect-mongo')(session);
  
  app.use(session({
    secret: 'ironhackRocks',
    cookie: {
      maxAge: 1000*60*60*24
    },
    store: new MongoStore({mongooseConnection: mongoose.connection, ttl: 60*60*24 })
  }));


// Express View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// 
app.locals.title = 'Express - Generated with IronGenerator';

const index = require('./routes/index.routes');
const auth = require('./routes/auth.routes');
const users = require('./routes/users.routes')
app.use('/', index);
app.use('/', auth);
app.use('/', users);

app.get('/profile', authenticated, (req, res) =>{res.render('users/profile.hbs', {user: req.session.loggedUser})});
app.get('/private', authenticated, (req, res) =>{res.render('users/private.hbs')});

module.exports = app;
