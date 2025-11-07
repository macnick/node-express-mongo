const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')

const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find()
  res.status(200).render('base', {
    title: 'All Tours',
    tours,
  })
})

const getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  })
  console.log(tour)
  res.status(200).render('tour', {
    title: tour.name,
    user: 'Nick',
    tour,
  })
})

module.exports = {
  getOverview,
  getTour,
}
