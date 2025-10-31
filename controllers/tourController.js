const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory')

const getTopFiveDeals = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}

const getAllTours = getAll(Tour)
const getTour = getOne(Tour, { path: 'reviews' }) // if need to populate more option use the object
const createTour = createOne(Tour)
const updateTour = updateOne(Tour)
const deleteTour = deleteOne(Tour)
const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')
  if (!lat || !lng) {
    throw new AppError('latitude and longitude not in the format lat,lng', 400)
  }

  const radiant = { mi: 3963.2, km: 6378.1 }
  const radius = distance / radiant[unit]
  if (!radius) {
    throw new AppError('unit must be either mi or km', 400)
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng * 1, lat * 1], radius],
      },
    },
  })
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  })
})

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')
  if (!lat || !lng) {
    throw new AppError('latitude and longitude not in the format lat,lng', 400)
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ])

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  })
})

const tourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 1.7 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numOfRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ])
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  })
})

const months = {
  1: 'January',
  2: 'Febuary',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'Auguest',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
}

const getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year // * 1  // not sure if we need to convert to number
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $sort: { numOfTours: -1 } },
    { $addFields: { month: '$_id', year: year } },
    { $project: { _id: 0 } },
  ])

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  })
})

module.exports = {
  getAllTours,
  getDistances,
  getMonthlyPlan,
  getTopFiveDeals,
  getTour,
  getToursWithin,
  createTour,
  updateTour,
  deleteTour,
  tourStats,
}
