const Review = require('../models/reviewModel')
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory')

const setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  req.body.user = req.user.id
  next()
}

const getAllReviews = getAll(Review)
const getReview = getOne(Review)
const createReview = createOne(Review)
const updateReview = updateOne(Review)
const deleteReview = deleteOne(Review)

module.exports = {
  getAllReviews,
  getReview,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
}
