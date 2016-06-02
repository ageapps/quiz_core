'use strict';

var crypto = require('crypto');

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('Users', [{
            username: 'admin',
            password: encryptPassword('admin', 'aaaa'),
            mail: 'age.quiz@gmail.com',
            salt: 'aaaa',
            foto: '/images/yo.jpg',
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            confirmed: true
        }, {
            username: 'Admin',
            password: encryptPassword('admin', 'aaaa'),
            mail: "adrian.gespinosa@gmail.com",
            foto: '/images/profile.png',
            salt: 'bbbbb',
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            confirmed: true
        }]);
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('Users', null, {});
    }
};

function encryptPassword(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};
