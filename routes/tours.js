const { protect, restrictTo } = require('../controllers/authController')
const reviewRouter = require('./reviews')

const express = require('express')
const {
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
} = require('../controllers/tourController')

const router = express.Router()

const checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    })
  }
  next()
}

router.use('/:tourId/reviews', reviewRouter)

router.route('/tour-stats').get(tourStats)
router.route('/top-5-deals').get(getTopFiveDeals, getAllTours)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin)
// there is no point for the route below but anyway
router.route('/distances/:latlng/unit/:unit').get(getDistances)
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), checkBody, createTour)
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)

module.exports = router
