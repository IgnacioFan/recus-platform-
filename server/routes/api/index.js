const admin = require('./adminRoute')
const main = require('./mainRoute')

// 引入JWT需要的middleware
const passport = require('../../config/passport')
const helper = require('../../_helpers')

const authenticated = (req, res, next) => {
  if (helper.ensureAuthenticated()) {
    return next()
  }
  return passport.authenticate('jwt', { session: false })(req, res, next)
}

const getUser = (req, res, next) => {
  req.user = helper.getUser(req)
  return next()
}

const authenticatedAdmin = (req, res, next) => {
  //console.log(req.user)
  if (!req.user) return res.status(401).json({ status: 'error', msg: 'permission denied for users' })
  if (req.user.role === 'admin') {
    return next()
  } else {
    return res.status(401).json({ status: 'error', msg: 'admin permission denied' })
  }
}

module.exports = (app) => {
  app.use('/api/', main)
  app.use('/api/admin', authenticated, getUser, authenticatedAdmin, admin)
}


// const express = require('express')
// const router = express.Router()

// // 引入JWT需要的middleware
// const passport = require('../../config/passport')
// //const authenticated = passport.authenticate('jwt', { session: false })
// const helper = require('../../_helpers')

// const userController = require('../../controllers/admin/userController')
// const memberController = require('../../controllers/admin/memberController')
// const dishController = require('../../controllers/admin/dishController')
// const orderController = require('../../controllers/admin/orderController')
// const categoryController = require('../../controllers/admin/categoryController')
// const tagController = require('../../controllers/admin/tagController')

// const { signupValidationRules, signinValidRules, validate } = require('../../controllers/validator')

// const authenticated = (req, res, next) => {
//   if (helper.ensureAuthenticated()) {
//     //passport.authenticate('jwt', { session: false })
//     return next()
//   }
//   //return res.status(401).json({ status: 'error', message: 'permission denied' })
//   return passport.authenticate('jwt', { session: false })(req, res, next)
//   //return next
// }

// const getUser = (req, res, next) => {
//   req.user = helper.getUser(req)
//   return next()
// }

// const authenticatedAdmin = (req, res, next) => {
//   //console.log(req.user)
//   if (!req.user) return res.status(401).json({ status: 'error', msg: 'permission denied for users' })
//   if (req.user.role === 'admin') {
//     return next()
//   } else {
//     return res.status(401).json({ status: 'error', msg: 'admin permission denied' })
//   }
// }
// assigned different roles


// // test router
// router.get('/', authenticated, (req, res) => {
//   console.log(req.user)
//   res.json({ username: req.user })
// })

// // 登入/登出
// router.post('/signup', signupValidationRules(), validate, userController.signUp)
// router.post('/signin', signinValidRules(), validate, userController.signIn)

// 使用者相關API
// router.get('/current_user', memberController.getCurrentUser)
// router.get('/users', authenticated, getUser, authenticatedAdmin, memberController.getUsers)
// router.get('/users/:id', authenticated, getUser, authenticatedAdmin, memberController.getUser)
// router.get('/members', memberController.getUsersPag)
// router.get('/members/search', memberController.searchMember)
// router.delete('/members/:id', memberController.deleteUser)
// router.put('/members/admin/:id', memberController.toggleAdmin)


// // 菜單相關API
// router.get('/dishes', authenticated, getUser, authenticatedAdmin, dishController.getDishWithCategory)
// router.get('/dishes/:id', authenticated, getUser, authenticatedAdmin, dishController.getDish)
// router.post('/dishes', authenticated, getUser, authenticatedAdmin, dishController.addDish)
// router.put('/dishes/:id', authenticated, getUser, authenticatedAdmin, dishController.updateDish)
// router.delete('/dishes/:id', authenticated, getUser, authenticatedAdmin, dishController.deleteDish)

// // 標籤相關API
// router.get('/tags', authenticated, getUser, authenticatedAdmin, tagController.getTags)
// router.get('/tag', tagController.searchTag)
// router.get('/tags/:id', authenticated, getUser, authenticatedAdmin, tagController.getTag)
// router.post('/tags', authenticated, getUser, authenticatedAdmin, tagController.addTag)
// router.put('/tags/:id', authenticated, getUser, authenticatedAdmin, tagController.updateTag)
// router.delete('/tags/:id', authenticated, getUser, authenticatedAdmin, tagController.deleteTag)

// // 訂單相關API
// router.get('/orders', orderController.getOrders)
// router.get('/orders/pendingNums', orderController.getPendingNums)
// router.get('/orders/unpaidNums', orderController.getUnpaidNums)
// router.get('/orders/:id', orderController.getOrder)
// router.post('/orders', orderController.postOrders)
// router.put('/orders/:id/prevState', orderController.prevStateOrder)
// router.put('/orders/:id/nextState', orderController.nextStateOrder)
// router.delete('/orders/:id', orderController.removeOrder)

// // 分類相關API
// router.get('/categories', categoryController.getCategories)
// router.get('/categories/:id', categoryController.getCategory)
// router.post('/categories', categoryController.addCategory)
// router.put('/categories/:id', categoryController.updateCategory)
// router.delete('/categories/:id', categoryController.removeCategory)


// module.exports = router