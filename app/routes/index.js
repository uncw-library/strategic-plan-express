const express = require('express')
const passport = require('passport')

const router = express.Router()

const plotController = require('../controllers/plot.js')
const searchController = require('../controllers/search.js')
const actionAreasController = require('../controllers/actionAreas.js')
const notesQueries = require('../queries/notes.js')


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
  res.render('login.hbs', {
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

router.get('/add-note/:objectiveID', async function (req, res, next) {
  const objectiveID = req.params.objectiveID
  const objective = await notesQueries.getActionAreaObjectiveByNoteID(objectiveID)
  payload = {
    objectiveData: objective,
    requestedObjective: objectiveID
  }
  res.render('addNote.hbs', payload)
})

router.post('/add-note', async function (req, res, next) {
  const username = req.body.username
  const note = req.body.note 
  const objectiveID = req.body.objective
  console.log(req.body)
  if (!username.length || !note.length) {
    res.redirect('/add-note/${objective}')
  }
  res.render('addNote.hbs')
})


router.get('/reference', function (req, res, next) {
  res.render('reference.hbs', { title: 'Reference' })
})


module.exports = router
