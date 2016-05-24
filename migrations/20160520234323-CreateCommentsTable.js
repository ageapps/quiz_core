'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
    
        return queryInterface.createTable('Comments', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            QuizId: {
                type: Sequelize.INTEGER
            },
            text: {
                type: Sequelize.STRING,
                validate: {
                    notEmpty: {
                        msg: "Comment is missing"
                    }
                }
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        }, {
            sync: {
                force: true
            }
        });
    },

    down: function(queryInterface, Sequelize) {
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.dropTable('users');
        */
        return queryInterface.dropTable('Comments');
    }
};
