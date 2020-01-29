const db = require('../../models')
const { User, Profile, Tag, UserPreferred } = db
const Op = require('sequelize').Op

const memberController = {
  testRoute: (req, res) => {
    return res.json({ status: 'success', msg: '路徑測試！' })
  },

  getProfile: (req, res) => {
    try {
      User.findByPk(req.user.id, {
        attributes: ['account', 'phone', 'createdAt'],
        include: [
          { model: Profile, attributes: ['name', 'email', 'avatar'] },
          { model: Tag, as: 'preferredTags' }]
      }).then(user => {
        return res.json({ user: user })
      })
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  },

  updateProfile: async (req, res) => {
    try {
      let { account, phone, name, email, avatar, tags } = req.body

      user = await User.findByPk(req.user.id, {
        attributes: ['id', 'account', 'phone', 'password'],
        include: [Profile]
      })

      // if(user.account !== account){
      //   account = await User.searchIsAccount(account)
      // } 

      await user.update({
        account: account,
        phone: phone,
      })

      await user.Profile.update({
        name: name,
        email: email,
        avatar: avatar
      })

      if (tags) {
        // await UserPreferred.delete({ where: { UserId: req.user.id } })
        for (let tag of tags) {
          await UserPreferred.findOrCreate({
            where: { TagId: tag.id, UserId: req.user.id },
            defaults: { TagId: tag.id, UserId: req.user.id }
          })
        }
      }

      return res.json({ status: 'success', msg: '更新成功!', user: user })
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  },

  addMyPreferred: async (req, res) => {
    try {
      let tags = req.body.tags
      if (!tags) return res.json({ status: 'error', msg: '請加入標籤!' })
      for (let tag of tags) {
        await UserPreferred.create({ TagId: tag.id, UserId: req.user.id })
      }
      return res.json({ status: 'success', msg: '新增成功!' })
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  },

  removeMyPreferred: async (req, res) => {
    try {
      let tags = req.body.removeTags
      //console.log(req.body.removeTags)
      if (!tags) return res.json({ status: 'error', msg: '請加入標籤!' })
      for (let i = 0; i < tags.length; i++) {
        await UserPreferred.destroy({ where: { TagId: tags[i].id, UserId: req.user.id } })
      }
      return res.json({ status: 'success', msg: '成功移除!' })
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  },

  searchTag: (req, res) => {
    try {
      // console.log(`%${req.query}%`)
      Tag.findAll({
        where: {
          name: {
            [Op.like]: `%${req.query.name}%`
          }
        }
      }).then(tag => {
        return res.json(tag)
      })
    } catch (error) {
      return res.status(500).json({ status: 'error', msg: error })
    }
  }
}

module.exports = memberController