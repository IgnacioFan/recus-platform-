const db = require('../../models')
const User = db.User
const bcrypt = require('bcryptjs')

const userController = {
  getUsers: (req, res) => {
    return User.findAll().then(users => {
      //console.log(users)
      return res.json(users)
    })
  },

  getUser: (req, res) => {
    if (Number(req.params.id) <= 0) {
      return res.json({ status: 'error', msg: 'No such user!' })
    }
    User.findByPk(req.params.id).then(user => {
      if (user == null) {
        return res.res.json({ status: 'error', msg: 'No such user!' })
      }
      console.log('user', user)
      return res.json(user)
    })
  },

  searchUser: (req, res) => {
    if (req.url.name == null) {
      return res.json({ status: 'error', msg: 'Input field should not be blank!' })
    }
    User.findOne({ where: { name: req.url.name } }).then(user => {
      if (user == null) {
        return res.json({ status: 'error', msg: 'Can find the the user name!' })
      }
      return res.json(user)
    })
  },
  // Signup signin routes
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
    }).then(user => {
      return res.redirect('/signin')
    })
  }
}

module.exports = userController