var express = require('express');
var cookieParser = require('cookie-parser');
var createError = require('http-errors');
const favicon = require('serve-favicon')
const LdapStrategy = require('passport-ldapauth').Strategy
var logger = require('morgan');
const passport = require('passport')
var path = require('path');
const session = require('cookie-session')
const hbs = require('hbs')

var indexRouter = require('./routes/index');
const ldapOpts = require('./ldap')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(favicon(path.join(__dirname, 'public', 'images', 'seahawk.ico')))
app.use(cookieParser());
app.use(session({
  keys: ['cookie-session-url-shortener', 'dockerisawesome-sierra', 'webwizards-sierra'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(logger('dev'));

passport.use(new LdapStrategy(ldapOpts))
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(function (user, done) {
  done(null, user.dn)
})
passport.deserializeUser(function (user, done) {
  done(null, user)
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// routing setup
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
