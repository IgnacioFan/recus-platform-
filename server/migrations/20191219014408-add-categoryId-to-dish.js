'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Dishes', 'CategoryId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'Categeroies',
        key: 'id'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Dishes', 'CategoryId')
  }
};
