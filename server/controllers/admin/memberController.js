const bcrypt = require('bcryptjs')
const db = require('../../models')
const { User, Order } = db
const Op = require('sequelize').Op

const memberController = {
  getUsers: (req, res) => {
    return User.findAll().then(users => {
      //console.log(users)
      return res.json({ users: users })
    })
  },

  getUser: (req, res) => {
    if (Number(req.params.id) <= 0) {
      return res.json({ status: 'error', msg: 'user id is undefined' })
    }
    // 取出單一會員，且排除管理者
    User.scope('excludedAdmin').findByPk(req.params.id).then(user => {
      if (user == null) {
        return res.json({ status: 'error', msg: 'no such user!' })
      }
      //console.log('user', user)
      return res.json({ user: user })
    })
  },

  getUsersPag: (req, res) => {
    const pageLimit = 14
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    User.findAndCountAll({ include: Order, offset: offset, limit: pageLimit }).then(user => {
      const page = Number(req.query.page) || 1
      const totalPage = Math.ceil(user.count / pageLimit)
      const data = user.rows
      return res.json({
        users: data,
        currentPage: page,
        totalPage: totalPage
      })
    })
  },

  deleteUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        user.destroy()
          .then((user) => {
            return res.json({ status: 'success', msg: 'The user has been deleted.' })
          })
      })
  },

  toggleAdmin: (req, res) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        user.update({
          isAdmin: !user.isAdmin
        }).then((user) => {
          return res.json({ status: 'success', msg: 'Toggled user admin.' })
        })
      })
  },

  searchUser: (req, res) => {
    // 電話不為空值
    if (!req.query.phone) {
      return res.json({ status: 'error', msg: '請輸入電話!' })
    }
    // 搜尋單一會員，且排除管理者
    User.scope('excludedAdmin').findOne({ where: { phone: req.query.phone } }).then(user => {
      if (!user) {
        return res.json({ status: 'error', msg: '查無資料!確認電話是否輸入錯誤!' })
      }
      return res.json(user)
    })
  },

  searchPhone: (req, res) => {
    if (req.query.phone == null) {
      return res.json({ status: 'error', msg: 'Input field should not be blank!' })
    }
    User.findOne({ where: { name: req.query.phone } }).then(user => {
      if (user == null) {
        return res.json({ status: 'error', msg: 'Can find the the user phone!' })
      }
      return res.json(user)
    })
  },
}

module.exports = memberController