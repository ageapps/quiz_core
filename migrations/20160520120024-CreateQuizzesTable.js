'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.
heroku run ./node_modules/.bin/sequelize db:seed:all --url postgres://hcarthtolgfcud:z3ptZMwk3mFW7wz0JSxW6k2TEm@ec2-23-23-224-174.compute-1.amazonaws.com:5432/dcgefj7svtar15
          Example:
          ./node_modules/.bin/sequelize migration:create --name AddCategoriesIdToQuizzesTable --url sqlite://$(pwd)/quiz.sqlite
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
        return queryInterface.dropTable('Quizzes');
    }
};
