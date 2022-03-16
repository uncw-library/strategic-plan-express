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

  if (!objectiveID.length) {
    res.redirect('/')
    return
  }

  if (!username.length || !note.length) {
    res.redirect(`/add-note/${objectiveID}?error=form_incomplete`)
    return
  }

  notesQueries.addNote(username, note, objectiveID)
    .then(res.redirect('/'))
})

router.get('/edit-summary/:objectiveID', async function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/')
    return
  }

  const objectiveID = req.params.objectiveID
  const payload = {
    objectiveData: await objectivesQueries.getObjectiveByObjectiveID(objectiveID),
    failure: req.query.error || false
  }
  res.render('editSummary.hbs', payload)
})

router.post('/edit-summary', async function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/')
    return
  }
  const bundle = {
    objectiveID: req.body.objectiveID,
    status: req.body.status,
    year: req.body.year,
    leads: req.body.leads,
    members: req.body.members
  }

  // shortcircuit if there's no objectiveID to work with
  if (!bundle.objectiveID.length) {
    res.redirect('/')
    return
  }

  // if no changes, no changes & send error message to screen
  if (!bundle.status.length && !bundle.year.length && !bundle.leads.length && !bundle.members.length) {
    res.redirect(`/edit-summary/${bundle.objectiveID}?error=no_changes_made`)
    return
  }

  // if any bundle items are un-entered, use the previous values already in the db
  const objective = await objectivesQueries.getObjectiveByObjectiveID(bundle.objectiveID)
  if (!bundle.status.length) {
    bundle.status = objective.status
  }
  if (!bundle.year.length) {
    bundle.year = objective.target_academic_year
  }
  if (!bundle.leads.length) {
    bundle.leads = objective.leads
  }
  if (!bundle.members.length) {
    bundle.members = objective.project_members
  }

  // send the update
  objectivesQueries.updateObjectives(bundle.objectiveID, bundle.status, bundle.year, bundle.leads, bundle.members)
    .then(res.redirect('/'))
})

router.get('/edit-measures/:objectiveID', async function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/')
    return
  }

  const objectiveID = req.params.objectiveID
  const payload = {
    objectiveData: await objectivesQueries.getObjectiveByObjectiveID(objectiveID),
    failure: req.query.error || false
  }

  console.log(payload.objectiveData)

  res.render('editMeasures.hbs', payload)
})

router.post('/edit-measures', async function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/')
    return
  }
  const bundle = {
    objectiveID: req.body.objectiveID,
    whatdata: req.body.whatdata,
    howoften: req.body.howoften,
    benchmark: req.body.benchmark
  }

  // shortcircuit if there's no objectiveID to work with
  if (!bundle.objectiveID.length) {
    res.redirect('/')
    return
  }

  // if no changes, no changes & send error message to screen
  if (!bundle.whatdata.length && !bundle.howoften.length && !bundle.benchmark.length) {
    res.redirect(`/edit-measures/${bundle.objectiveID}?error=no_changes_made`)
    return
  }

  // if any bundle items are un-entered, use the previous values already in the db
  const objective = await objectivesQueries.getObjectiveByObjectiveID(bundle.objectiveID)
  if (!bundle.whatdata.length) {
    bundle.whatdata = objective.what_data_will_be_collected
  }
  if (!bundle.howoften.length) {
    bundle.howoften = objective.how_often_assessed
  }
  if (!bundle.benchmark.length) {
    bundle.benchmark = objective.acceptable_benchmarks
  }

  // send the update
  objectivesQueries.updateMeasures(bundle.objectiveID, bundle.whatdata, bundle.howoften, bundle.benchmark)
    .then(res.redirect('/'))
})

router.get('/reference', function (req, res, next) {
  res.render('reference.hbs', { title: 'Reference' })
})

module.exports = router
