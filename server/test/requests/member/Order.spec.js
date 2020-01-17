process.env.NODE_ENV = 'test'

var chai = require('chai')
var request = require('supertest')
var sinon = require('sinon')
var app = require('../../../app')

var helper = require('../../../_helpers');
var should = chai.should();
var expect = chai.expect;
const db = require('../../../models')
const moment = require('moment')
var tk = require('timekeeper')
const nowTime = new Date()
const time1 = moment(nowTime, "YYYY-M-D H:m").subtract(1, 'days').toDate() //moment().subtract(1, 'days')
const time2 = moment(nowTime, "YYYY-M-D H:m").subtract(2, 'days').toDate()

const order1 = {
  quantity: 4,
  amount: 140,
  memo: 'this is first order',
  tableNum: 2,
  isTakingAway: false,
  UserId: 1,
  createdAt: time1
}
const order2 = {
  quantity: 3,
  amount: 100,
  memo: 'this is second order',
  tableNum: 0,
  isTakingAway: true,
  UserId: 1,
  createdAt: time2
}
const dishCombo1 = [{ id: 1, quantity: 2, price: 30 }, { id: 2, quantity: 2, price: 40 }]
const dishCombo2 = [{ id: 1, quantity: 2, price: 30 }, { id: 2, quantity: 1, price: 40 }]
const dish1 = { name: 'mocha', price: 30, CategoryId: 1 }
const dish2 = { name: 'latie', price: 40, CategoryId: 1 }

describe('# Member::Order Request', () => {

  context('if member sign in', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helper, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helper, 'getUser'
      ).returns({ id: 1, role: 'member' })
    })

    it('should pass the test', (done) => {
      request(app)
        .get('/api/member/test')
        .expect(200)
        .expect({ status: 'success', msg: '路徑測試！' }, done)
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
    })
  })

  context('go to My Order Page', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helper, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helper, 'getUser'
      ).returns({ id: 1, role: 'member' })
      tk.freeze(nowTime)

      await db.Order.destroy({ where: {}, force: true, truncate: true })
      await db.DishCombination.destroy({ where: {}, truncate: true })
      await db.Dish.destroy({ where: {}, truncate: true })

      await db.Dish.create(dish1)
      await db.Dish.create(dish2)
      await db.Order.create(order1)
      for (let i = 0; i < dishCombo1.length; i++) {
        await db.DishCombination.create({
          DishId: dishCombo1[i].id,
          OrderId: 1,
          perAmount: dishCombo1[i].price,
          perQuantity: dishCombo1[i].quantity,
          createdAt: time1
        })
      }
      await db.Order.create(order2)
      for (let i = 0; i < dishCombo2.length; i++) {
        await db.DishCombination.create({
          DishId: dishCombo2[i].id,
          OrderId: 2,
          perAmount: dishCombo2[i].price,
          perQuantity: dishCombo2[i].quantity,
          createdAt: time2
        })
      }
    })

    it('should get my all order records', (done) => {
      request(app)
        .get('/api/member/orders')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          //console.log(res.body.orders)
          expect(res.body.orders.length).to.be.equal(2)
          expect(res.body.orders[0].id).to.be.equal(1)
          expect(res.body.orders[1].id).to.be.equal(2)
          return done()
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      tk.reset()
      await db.Order.destroy({ where: {}, force: true, truncate: true })
      await db.DishCombination.destroy({ where: {}, truncate: true })
      await db.Dish.destroy({ where: {}, truncate: true })
    })
  })
})