const express = require('express')
const passport = require('passport')

const router = express.Router()

const plotController = require('../controllers/plot.js')
const searchController = require('../controllers/search.js')
const actionAreasController = require('../controllers/actionAreas.js')
const notesQueries = require('../queries/notes.js')
const objectivesQueries = require('../queries/objectives.js')


router.post('/login', passport.authenticate('ldapauth', { failureRedirect: '/login?failure=true' }), async (req, res, next) => {
  res.redirect('/')
})

router.get('/logout', function (req, res, next) {
  req.logout()
  res.redirect('/')
})

router.get('/', async function (req, res, next) {
  // plot data is sent to client js, so it must be json encoded.
  const payload = {
    title: 'Actual App',
    plotData: JSON.stringify(await plotController.getPlotData()),
    searchOptionsData: await searchController.getSearchOptions(),
    actionAreasData: await actionAreasController.getActionAreas(),
    loggedIn: req.isAuthenticated()
  }
  res.render('index.hbs', payload)
})

router.get('/login', function (req, res, next) {
  res.render('login.hbs', {
    layout: 'layout',
    failure: (req.query.failure),
    loggedIn: false
  })
})

router.get('/add-note/:objectiveID', async function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/')
    return
  }

  const payload = {
    objectiveData: null,
    loggedIn: req.isAuthenticated(),
    failure: false
  }
  payload.failure = req.query.error
  payload.objectiveID = req.params.objectiveID
  payload.objectiveData = await objectivesQueries.getObjectiveByObjectiveID(payload.objectiveID)
  res.render('addNote.hbs', payload)
})

router.post('/add-note', async function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/')
    return
  }
  const username = req.body.username
  const note = req.body.note 
  const objectiveID = req.body.objectiveID

  if ( !objectiveID.length ) {
    res.redirect(`/`)
    return
  }

  if ( !username.length || !note.length ) {
    res.redirect(`/add-note/${noteID}?error=form_incomplete`)
    return
  }

  notesQueries.addNote(username, note, objectiveID)
    .then(res.redirect('/'))
})


router.get('/reference', function (req, res, next) {
  res.render('reference.hbs', { title: 'Reference' })
})


module.exports = router
