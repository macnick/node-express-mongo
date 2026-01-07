const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')

const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find()
  res.status(200).render('base', {
    title: 'All Tours',
    tours,
    error: false,
  })
})

const getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  })
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404))
  }
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  })
})

const login = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  })
}

const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  })
}

const updateUserData = catchAsync(async (req, res, next) => {
  console.log('updating user...', req.body, req.user)
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  )

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  })
  next()
})

module.exports = {
  getOverview,
  getTour,
  login,
  getAccount,
  updateUserData,
}
