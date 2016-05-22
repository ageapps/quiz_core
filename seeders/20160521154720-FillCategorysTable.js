'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.bulkInsert('Person', [{
            name: 'John Doe',
            isBetaMember: false
          }], {});
        */
        return queryInterface.bulkInsert('Categories', [{
            text: 'Geography',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Entertainment',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Science',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Literature',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'History',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Sports',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Languaje',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Movies',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Television',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Music',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Gaming',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Food',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Other',
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },

    down: function(queryInterface, Sequelize) {
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.bulkDelete('Person', null, {});
        */
        return queryInterface.bulkDelete('Categories', null, {});
    }
};
