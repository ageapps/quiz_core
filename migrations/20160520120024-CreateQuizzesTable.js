'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.createTable('users', { id: Sequelize.INTEGER });
        */
        return queryInterface.createTable('Quizzes', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            question: {
                type: Sequelize.STRING,
                validate: {
                    notEmpty: {
                        msg: "Question is missing"
                    }
                }
            },
            answer: {
                type: Sequelize.STRING,
                validate: {
                    notEmpty: {
                        msg: "Question is missing"
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
./node_modules/.bin/sequelize seed:create --name FillQuizzesTable --url sqlite:///quiz.sqlite
          Example:
          return queryInterface.dropTable('users');
        */
        return queryInterface.dropTable('Quizzes');
    }
};
