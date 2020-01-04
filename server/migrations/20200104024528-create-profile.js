'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        defaultValue: 'none'
      },
      email: {
        type: Sequelize.STRING,
        defaultValue: 'none',
        unique: true
      },
      avatar: {
        type: Sequelize.STRING,
        defaultValue: 'none'
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Profiles');
  }
};