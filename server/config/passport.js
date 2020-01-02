const passport = require('passport')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const db = require('../models')
const User = db.User

const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = process.env.JWT_SECRET || 'alphacamp'

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const user = await User.findByPk(jwt_payload.id)
    console.log('hi', user)
    if (!user) return done(null, false)
    return done(null, user)
  } catch (err) {
    done(err, false)
  }
}))

// // serialize and deserialize user
// passport.serializeUser((user, cb) => {
//   cb(null, user.id)
// })
// passport.deserializeUser((id, cb) => {
//   User.findByPk(id)
//     .then(user => {
//       return cb(null, user)
//     })
// })

module.exports = passport