const express = require('express')
const cookieParser = require('cookie-parser')
const createError = require('http-errors')
const favicon = require('serve-favicon')
const LdapStrategy = require('passport-ldapauth').Strategy
const logger = require('morgan')
const passport = require('passport')
const path = require('path')
const session = require('cookie-session')
const hbs = require('hbs') // not sure if this import is needed

const indexRouter = require('./routes/index')
const ldapOpts = require('./ldap')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
hbs.registerPartials(path.join(__dirname, 'views', 'partials'))

app.use(favicon(path.join(__dirname, 'public', 'images', 'seahawk.ico')))
app.use(cookieParser())
app.use(session({
  keys: ['cookie-session-url-shortener', 'dockerisawesome-sierra', 'webwizards-sierra'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(logger('dev'))

passport.use(new LdapStrategy(ldapOpts))
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(function (user, done) {
  done(null, user.dn)
})
passport.deserializeUser(function (user, done) {
  done(null, user)
})

// app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// routing setup
app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

hbs.registerHelper('equal', function (arg1, arg2) {
  return (arg1 === arg2)
})

hbs.registerHelper('notequal', function (arg1, arg2) {
  return (arg1 !== arg2)
})

hbs.registerHelper('includes', function (needle, haystack) {
  // haystack is like "name1,name2,name3"
  if (!needle || !haystack) {
    return false
  }
  const isMatch = (haystack === needle) || (haystack.split(',').includes(needle))
  return isMatch
})

hbs.registerHelper('notincludes', function (needle, haystack) {
  // haystack is like "name1,name2,name3"
  if (!needle || !haystack) {
    return true
  }
  const isMatch = (haystack === needle) || (haystack.split(',').includes(needle))
  return !isMatch
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error.hbs')
})

module.exports = app
