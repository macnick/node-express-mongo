const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: './config.env' })

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})

const app = require('./app')

const port = process.env.PORT || 3000
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful!')
  })

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
