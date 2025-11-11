const express = require('express')
const {
  getOverview,
  getTour,
  login,
} = require('../controllers/viewsController')
const { isLoggedIn } = require('../controllers/authController')

const router = express.Router()

router.use(isLoggedIn)
router.get('/', getOverview)
router.get('/login', login)
router.get('/tours/:slug', getTour)

module.exports = router
