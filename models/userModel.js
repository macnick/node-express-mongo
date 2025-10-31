const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
    minLength: [3, 'Name must be at least 3 chars. I got {VALUE} chars.'],
    maxLength: [20, 'Name must be at most 20 chars. I got {VALUE} chars.'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: [8, 'Password must be at least 8 chars. I got {VALUE} chars.'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must have a password confirmation'],
    validate: {
      // this only works on save and create!!!
      validator: function (password) {
        return password === this.password
      },
      message: "Passwords don't match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
})

userSchema.methods.correctPassword = async function (suppliedPassword) {
  return await bcrypt.compare(suppliedPassword, this.password)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    return JWTTimestamp < changedTimestamp
  }
  return false
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  return resetToken
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  this.passwordChangedAt = Date.now() - 1000 // increase the token exp duration instead
  next()
})

userSchema.pre(/^find/, function (next) {
  this.find({ active: true })
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
