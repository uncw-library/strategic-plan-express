const express = require('express')
const router = express.Router()
const plotController = require('../controllers/plot.js')
const searchController = require('../controllers/search.js')

/* GET home page. */
router.get('/', async function (req, res, next) {
  // plotData is sent to client js, so it must be json encoded.
  const plotData = await plotController.getPlotData()
  const jsonPlotData = JSON.stringify(plotData)

  const searchOptions = await searchController.getSearchOptions()
  console.log(searchOptions)

  const payload = {
    title: 'Actual App',
    plotData: jsonPlotData,
    searchOptions: searchOptions

  }
  res.render('index.hbs', payload)
})

router.get('/reference', function (req, res, next) {
  res.render('reference.hbs', { title: 'Reference' })
})

module.exports = router
