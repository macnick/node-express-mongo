const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'The review must be at least 200 characters'],
    minLength: [
      10,
      'The review must be at least 200 characters long. I got {VALUE} chars.',
    ],
  },
  rating: {
    type: Number,
    required: [true, "Can't have a review without rating"],
    min: [1],
    max: [5],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
})

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  })
  next()
})

reviewSchema.pre('save', async function (next) {
  if (!this.tour) this.tour = this.params.tourId
  if (!this.user) this.user = this.user._id
  next()
})

reviewSchema.post('save', function () {
  // post middleware does not get access to next
  // this points to current review
  this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ])
  console.log(stats)
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats.length > 0 ? stats[0]?.nRating : 0,
    ratingsAverage: stats.length > 0 ? stats[0]?.avgRating : 4.5,
  })
}

reviewSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcAverageRatings(doc.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
