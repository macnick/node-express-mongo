class ApiFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    const { page, sort, limit, fields, ...queryObj } = this.queryString
    const queryStr = JSON.stringify(queryObj)
    const objQuery = JSON.parse(queryStr.replace(/\b(gte?|lte?)\b/g, '$$$&'))

    this.query = this.query.find(objQuery)
    return this
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }
    return this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }
    return this
  }

  paginate() {
    const pageInt = parseInt(this.queryString.page) || 1
    const limitInt = parseInt(this.queryString.limit) || 100
    const skip = (pageInt - 1) * limitInt

    this.query = this.query.skip(skip).limit(limitInt)
    return this
  }
}

module.exports = ApiFeatures
