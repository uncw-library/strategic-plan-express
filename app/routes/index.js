const express = require('express')
const router = express.Router()
const plotController = require('../controllers/plot.js')
const searchController = require('../controllers/search.js')
const actionAreasController = require('../controllers/actionAreas.js')


router.get('/', async function (req, res, next) {
  // plotData is sent to client js, so it must be json encoded.
  const plotData = JSON.stringify(await plotController.getPlotData())
  const searchOptions = await searchController.getSearchOptions()
  const actionAreas = await actionAreasController.getActionAreas()

  const payload = {
    title: 'Actual App',
    plotData: plotData,
    searchOptions: searchOptions,
    actionAreas: actionAreas
  }
  res.render('index.hbs', payload)
})


router.get('/reference', function (req, res, next) {
  res.render('reference.hbs', { title: 'Reference' })
})


module.exports = router
