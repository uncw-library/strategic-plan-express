const express = require('express')
const passport = require('passport')

const router = express.Router()

const plotController = require('../controllers/plot.js')
const searchController = require('../controllers/search.js')
const actionAreasController = require('../controllers/actionAreas.js')
const notesQueries = require('../queries/notes.js')
const objectivesQueries = require('../queries/objectives.js')
const constantsQueries = require('../queries/constants.js')
const downloadController = require('../controllers/download.js')

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

router.get('/', async function (req, res, next) {
  // plot data is sent to client js, so it must be json encoded.
  const payload = {
    title: 'Strategic Plan Tracker',
    plotData: JSON.stringify(await plotController.getPlotData(next).catch(next)),
    searchOptionsData: await searchController.getSearchOptions(next).catch(next),
    actionAreasData: await actionAreasController.getActionAreas(next).catch(next),
    loggedIn: req.isAuthenticated()
  }
  res.render('index.hbs', payload)
})

router.post('/', async function (req, res, next) {
  // "Filter by:" search box uses this endpoint
  // plot data is sent to client js, so it must be json encoded.
  const payload = {
    title: 'Strategic Plan Tracker',
    plotData: JSON.stringify(await plotController.getPlotData(next).catch(next)),
    searchOptionsData: await searchController.getSearchOptions(next).catch(next),
    actionAreasData: await actionAreasController.getSelectedActionAreas(req.body, next).catch(next),
    loggedIn: req.isAuthenticated()
  }
  res.render('index.hbs', payload)
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
  payload.objectiveData = await objectivesQueries.getObjectiveByObjectiveID(payload.objectiveID, next).catch(next)
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

  notesQueries.addNote(username, note, objectiveID, next)
    .then(res.redirect('/'))
    .catch(next)
})

router.get('/edit-summary/:objectiveID', async function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/')
    return
  }

  const objectiveID = req.params.objectiveID
  const payload = {
    statusChoices: await constantsQueries.getStatuses(next).catch(next),
    yearChoices: await constantsQueries.getYears(next).catch(next),
    userChoices: await constantsQueries.getUsers(next).catch(next),
    objectiveData: await objectivesQueries.getObjectiveByObjectiveID(objectiveID, next).catch(next),
    loggedIn: req.isAuthenticated(),
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

  // convert multiselect arrays to "item1,item2,item3"
  if (Array.isArray(bundle.leads)) {
    bundle.leads = bundle.leads.toString()
  }
  if (Array.isArray(bundle.members)) {
    bundle.members = bundle.members.toString()
  }

  // send the update
  objectivesQueries.updateObjectives(bundle.objectiveID, bundle.status, bundle.year, bundle.leads, bundle.members, next)
    .then(res.redirect('/'))
    .catch(next)
})

router.get('/edit-measures/:objectiveID', async function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/')
    return
  }

  const objectiveID = req.params.objectiveID
  const payload = {
    objectiveData: await objectivesQueries.getObjectiveByObjectiveID(objectiveID, next).catch(next),
    loggedIn: req.isAuthenticated(),
    failure: req.query.error || false
  }
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
    benchmark: req.body.benchmark,
    documents: req.body.documents
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
  const objective = await objectivesQueries.getObjectiveByObjectiveID(bundle.objectiveID, next).catch(next)
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
  objectivesQueries.updateMeasures(bundle, next)
    .then(res.redirect('/'))
    .catch(next)
})

router.get('/download-csv', async function (req, res, next) {
  downloadController.writeCSV(next)
    .then(filepath => res.download(filepath))
    .catch(next)
})

router.get('/download-report', async function (req, res, next) {
  downloadController.writeReport(next)
    .then(filepath => res.download(filepath))
    .catch(next)
})

module.exports = router
