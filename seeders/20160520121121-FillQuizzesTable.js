'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('Quizzes', [{
            question: 'Capital de Italia',
            answer: "Roma",
            createdAt: new Date(),
            updatedAt: new Date(),
            AuthorId: 1
        }, {
            question: 'Capital de Portugal',
            answer: "Lisboa",
            createdAt: new Date(),
            updatedAt: new Date(),
            AuthorId: 1
        }, {
            question: 'Capital de España',
            answer: "Madrid",
            createdAt: new Date(),
            updatedAt: new Date(),
            AuthorId: 1
        }]);
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('Quizzes', null, {});
    }
};
