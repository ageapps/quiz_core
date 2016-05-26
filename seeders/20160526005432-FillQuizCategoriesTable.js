'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('QuizCategories', [{
            QuizId: 1,
            CategoryId: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            QuizId: 2,
            CategoryId: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            QuizId: 3,
            CategoryId: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('QuizCategories', null, {});
    }
};
