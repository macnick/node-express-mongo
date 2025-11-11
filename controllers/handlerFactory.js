const AppError = require('../utils/appError')
const ApiFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new AppError(`No ${Model.modelName} found with that ID`, 404))
    }
    res.status(204).json({
      status: 'success',
      data: null,
    })
  })

const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)
    if (!doc) {
      return next(new AppError(`Could not create ${Model.modelName}`, 500))
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    })
  })

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!doc) {
      return next(new AppError(`No ${Model.modelName} found with that ID`, 404))
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    })
  })

const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return next(new AppError(`No ${Model.modelName} found with that ID`, 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    })
  })

const getAll = (Model) =>
  catchAsync(async (req, res) => {
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }
    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const docs = await features.query //.explain()
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs,
    })
  })

module.exports = {
  deleteOne,
  getOne,
  createOne,
  getAll,
  updateOne,
}
