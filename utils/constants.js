const days = 90

const cookieOptions = {
  httpOnly: true,
  expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  secure: true,
}

module.exports = { cookieOptions }
