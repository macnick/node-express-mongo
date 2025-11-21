const fs = require('fs')
const express = require('express')
const {
  getAllUsers,
  getUser,
  getMe,
  updateMe,
  deleteMe,
  updateUser,
  deleteUser,
} = require('../controllers/userController')
const {
  login,
  logout,
  signup,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
} = require('../controllers/authController')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

router.use(protect) // this will protect all routes after this middleware

router.patch('/updateMyPassword', updatePassword)
router.get('/me', getMe, getUser) // there is a reason for placing this before the :id route
router.patch('/updateMe', updateMe)
router.delete('/deleteMe', deleteMe)
router.route('/').get(getAllUsers)
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(protect, restrictTo('admin'), deleteUser)

module.exports = router
