const db = require('../../models')
const events = require('events')
const stateMachine = new events.EventEmitter()
const socketMachine = new events.EventEmitter()

const { Order, DishCombination } = db
const moment = require('moment')

const app = require('../../app')
const http = require('http').Server(app);
// const socket = require('../../config/socket')

stateMachine.on('prev', (order) => {
  let prevState
  if (order.state === 'pending') return
  if (order.state === 'making') prevState = 'pending'
  if (order.state === 'unpaid') prevState = 'making'
  if (order.state === 'paid') prevState = 'unpaid'
  return order.update({ state: prevState })
})

stateMachine.on('next', (order) => {
  let nextState
  if (order.state === 'pending') nextState = 'making'
  if (order.state === 'making') nextState = 'unpaid'
  if (order.state === 'unpaid') nextState = 'paid'
  if (order.state === 'paid') return
  return order.update({ state: nextState })
})

socketMachine.on('connect', async (socket, res) => {
  try {
    // console.log('you do emmit socket!!!')
    // console.log('fuck a user is connected', socket.id)
    socket.emit('status', 'local')
    
    pending = await Order.scope('todayOrder').count({ where: { state: 'pending' } })
    unpaid = await Order.scope('todayOrder').count({ where: { state: 'unpaid' } })
    socket.emit('realtime', { pending: pending, unpaid: unpaid })
    // socket.disconnect()
  } catch (error) {
    return res.status(500).json({ status: 'error', msg: error })
  }
})


const orderController = {

  addOrder: async (req, res) => {
    try {
      if (req.body.dishes.length === 0) {
        return res.json({ status: 'error', msg: '請輸入至少一樣菜單' })
      }

      let quantity = 0
      let amount = 0
      let comboDishes = []

      // 計算總額與數量
      req.body.dishes.forEach(dish => {
        quantity = quantity + dish.quantity
        amount = amount + dish.price * dish.quantity
        comboDishes.push({ DishId: dish.id, quantity: dish.quantity, amount: dish.price * dish.quantity })
      })
      // 驗證總額
      if (Number(req.body.amount) !== amount) {
        return res.json({ status: 'error', msg: '總額不符' })
      }
      // 驗證總數
      if (Number(req.body.quantity) !== quantity) {
        return res.json({ status: 'error', msg: '數量不符' })
      }
      // 驗證內用需要輸入桌號
      if (req.body.isTakingAway === 0) {
        if (req.body.tableNum === null) {
          return res.json({ status: 'error', msg: '內用請輸入桌號' })
        }
      }

      // 新增訂單
      order = await Order.create({
        quantity: req.body.quantity,
        amount: req.body.amount,
        memo: req.body.memo,
        tableNum: req.body.tableNum,
        isTakingAway: req.body.isTakingAway,
        UserId: req.body.UserId !== "" ? req.body.UserId : null
      })

      // 新增菜單組合
      for (let i = 0; i < comboDishes.length; i++) {
        await DishCombination.create({
          OrderId: order.id,
          DishId: comboDishes[i].DishId,
          perQuantity: comboDishes[i].quantity,
          perAmount: comboDishes[i].amount
        })
      }

      let socket = req.app.get('socket')
      socketMachine.emit('connect', socket, res)

      return res.json({ status: 'success', msg: '訂單新增成功!', order: order })

    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  },

  // 顯示當日所有訂單
  getOrders: (req, res) => {
    try {
      if (!req.query.state) return res.json({ status: 'error', msg: '沒有取得狀態!' })
      let state = ""
      // 尚未製作
      if (req.query.state === 'pending') {
        state = 'pending'
      } // 製作中
      else if (req.query.state === 'making') {
        state = 'making'
      } // 尚未結帳
      else if (req.query.state === 'unpaid') {
        state = 'unpaid'
      } // 已結帳的訂單
      else if (req.query.state === 'paid') {
        state = 'paid'
      } // 錯誤狀態
      else {
        if (!req.query.state) return res.json({ status: 'error', msg: '查無資料' })
      }

      if (state) {
        Order.scope('todayOrder').findAll({
          attributes: ['id', 'amount', 'quantity', 'isTakingAway', 'tableNum', 'state', 'UserId', 'createdAt'],
          include: [{ model: db.Dish, attributes: ['name'], as: 'sumOfDishes', through: { attributes: ['perQuantity'] } }],
          where: { state: state },
          order: [['id', 'DESC']]
        }).then(orders => {
          if (!orders) res.status(400).json({ status: 'error', msg: '今日未有任何訂單!' })

          return res.json({ orders: orders })
        })
      } else {
        return res.json({ status: 'error', msg: '404' })
      }
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  },

  // 顯示單筆訂單
  getOrder: (req, res) => {
    try {
      Order.scope('todayOrder').findByPk(req.params.id, {
        attributes: ['id', 'amount', 'quantity', 'memo', 'isTakingAway', 'tableNum', 'createdAt'],
        include: [{ model: db.Dish, attributes: ['name'], as: 'sumOfDishes', through: { attributes: ['perQuantity'] } }]
      }).then(order => {
        if (!order) return res.status(400).json({ status: 'error', msg: '查無資料!' })
        return res.json({ order: order })
      })
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  },

  // 訂單狀態往後
  prevStateOrder: (req, res) => {
    try {
      Order.findByPk(req.params.id).then(order => {
        stateMachine.emit('prev', order)

        let socket = req.app.get('socket')
        socketMachine.emit('connect', socket, res)

        return res.json(order)
      })
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  },

  // 訂單狀態往前
  nextStateOrder: (req, res) => {
    try {
      Order.findByPk(req.params.id).then(order => {
        stateMachine.emit('next', order)

        let socket = req.app.get('socket')
        socketMachine.emit('connect', socket, res)

        return res.json(order)
      })
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  },

  // 刪除訂單(訂單狀態區別強/弱刪除)
  removeOrder: (req, res) => {
    try {
      Order.findByPk(req.params.id).then(order => {
        if (order.state === 'paid') order.destroy()
        else {
          order.destroy({ force: true })
          DishCombination.destroy({ where: { OrderId: order.id } }).then(combo => {
            //console.log(combo)
            socketMachine.emit('connect')
            return res.json({ status: 'success', msg: '成功刪除了此訂單!' })
          })
        }
      })
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  },

  getPendingNums: (req, res) => {
    try {
      Order.scope('todayOrder').count({ where: { state: 'pending' } }).then((nums => {
        if (app.emitter) {
          app.emitter.emit('pendingEvent', nums)
        }
        return res.json(nums)
      }))
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  },

  getUnpaidNums: (req, res) => {
    try {
      Order.scope('todayOrder').count({ where: { state: 'unpaid' } }).then((nums => {
        return res.json(nums)
      }))
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  }


}

module.exports = orderController