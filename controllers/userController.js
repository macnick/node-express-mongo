const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory')

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    )
  }
  const id = req.user.id
  const body = {
    name: req.body.name,
    email: req.body.email,
  }
  const user = await User.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  })

  if (user) {
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    })
  } else {
    return next(new AppError('No user found with that ID', 404))
  }
})

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

const getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

const getAllUsers = getAll(User)
const getUser = getOne(User)
const updateUser = updateOne(User)
const deleteUser = deleteOne(User)

module.exports = {
  getAllUsers,
  getUser,
  getMe,
  updateMe,
  deleteMe,
  updateUser,
  deleteUser,
}
