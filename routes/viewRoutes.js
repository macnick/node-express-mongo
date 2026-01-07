const express = require('express')
const {
  getOverview,
  getTour,
  login,
  updateUserData,
} = require('../controllers/viewsController')
const {
  isLoggedIn,
  account,
  redirectIfNotLoggedIn,
  protect,
} = require('../controllers/authController')

const router = express.Router()

router.use(isLoggedIn)
router.get('/', getOverview)
router.get('/login', login)
router.get('/tours/:slug', getTour)
router.get('/account', redirectIfNotLoggedIn, account)
router.post('/submit-user-data', protect, updateUserData)

module.exports = router
