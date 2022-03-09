const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index.hbs', { title: 'Actual App' })
})

router.get('/reference', function (req, res, next) {
  res.render('reference.hbs', { title: 'Reference' })
})

module.exports = router
