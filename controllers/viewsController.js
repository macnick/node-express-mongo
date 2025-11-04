const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')

const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find()
  console.log(tours[0])
  res.status(200).render('base', {
    page: 'overview',
    title: 'All Tours',
    tours,
  })
})

const getTour = (req, res) => {
  res.status(200).render('base', {
    title: 'The forest hiker tour',
    page: 'tour',
    user: 'Nick',
  })
}

module.exports = {
  getOverview,
  getTour,
}
