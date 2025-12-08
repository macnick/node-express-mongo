const express = require('express')
const {
  getOverview,
  getTour,
  login,
} = require('../controllers/viewsController')
const {
  isLoggedIn,
  account,
  redirectIfNotLoggedIn,
} = require('../controllers/authController')

const router = express.Router()

router.use(isLoggedIn)
router.get('/', getOverview)
router.get('/login', login)
router.get('/tours/:slug', getTour)
router.get('/account', redirectIfNotLoggedIn, account)

module.exports = router
