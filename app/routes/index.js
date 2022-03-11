const express = require('express')
const passport = require('passport')

const router = express.Router()

const plotController = require('../controllers/plot.js')
const searchController = require('../controllers/search.js')
const actionAreasController = require('../controllers/actionAreas.js')


router.get('/', async function (req, res, next) {

  // plot data is sent to client js, so it must be json encoded.
  const plot = JSON.stringify(await plotController.getPlotData())
  const searchOptions = await searchController.getSearchOptions()
  const actionAreas = await actionAreasController.getActionAreas()

  const payload = {
    title: 'Actual App',
    plotData: plot,
    searchOptionsData: searchOptions,
    actionAreasData: actionAreas,
    loggedIn: req.isAuthenticated()
  }
  res.render('index.hbs', payload)
})

router.get('/login', function (req, res, next) {
  res.render('login', {
    layout: 'layout',
    failure: (req.query.failure),
    loggedIn: false
  })
})

router.post('/login', passport.authenticate('ldapauth', { failureRedirect: '/login?failure=true' }), async (req, res, next) => {
  res.redirect('/')
})

router.get('/logout', function (req, res, next) {
  req.logout()
  res.redirect('/')
})



router.get('/reference', function (req, res, next) {
  res.render('reference.hbs', { title: 'Reference' })
})


module.exports = router
