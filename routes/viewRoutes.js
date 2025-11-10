const express = require('express')
const {
  getOverview,
  getTour,
  login,
} = require('../controllers/viewsController')

const router = express.Router()

router.get('/', getOverview)
router.get('/login', login)
router.get('/tours/:slug', getTour)

module.exports = router
