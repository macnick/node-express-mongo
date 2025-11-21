const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const crypto = require('crypto')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')
const { cookieOptions } = require('../utils/constants')

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  if (process.env.NODE_ENV === 'development') {
    cookieOptions.secure = false
  }
  res.cookie('jwt', token, cookieOptions)
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      // return only necessary user data
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  })

  createAndSendToken(newUser, 201, res)
})

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400))
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password')
  // 3) If everything ok, send token to client

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401))
  }

  createAndSendToken(user, 200, res)
})

const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
  })
  res.status(200).json({ status: 'success' })
}

const protect = catchAsync(async (req, res, next) => {
  let token
  // 1 check if token exists
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (req.cookies.jwt) {
    token = req.cookies.jwt
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    )
  }
  // 2 validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  console.log('decoded', decoded)
  // 3 check if user still exists
  const verifyUser = await User.findById(decoded.id)
  if (!verifyUser) {
    return next(new AppError('This user does no longer exist.', 401))
  }

  // 4 check if user changed password after the token was issued
  if (verifyUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    )
  }
  req.user = verifyUser
  next()
})

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      )
    }
    next()
  }

const forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email
  const user = await User.findOne({ email })
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404))
  }
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateModifiedOnly: true })

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    })

    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email!',
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateModifiedOnly: true })

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    )
  }
  next()
})

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')
  // If user exists and token has not expired, set the new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400))
  }
  // Update changedPasswordAt property for the user
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()
  // Log the user in, send JWT
  createAndSendToken(user, 200, res)
})

const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')
  if (await !user.correctPassword(res.body.passwordCurrent, user.password)) {
    return next(new AppError('Your current password is wrong.', 401))
  }
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()

  createAndSendToken(user, 200, res)
})

const isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      )

      const currentUser = await User.findById(decoded.id)
      if (!currentUser) {
        return next(new AppError('This user does no longer exist.', 401))
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next()
      }
      // Make user data available in templates res.locals.variableName
      res.locals.user = currentUser
      return next()
    } catch (err) {
      res.locals.user = null
      return next()
    }
  }
  res.locals.user = null
  next()
})

module.exports = {
  login,
  logout,
  isLoggedIn,
  signup,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
}
