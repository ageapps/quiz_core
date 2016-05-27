'use strict';

var crypto = require('crypto');

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('Users', [{
            username: 'admin',
            password: encryptPassword('admin', 'aaaa'),
            salt: 'aaaa',
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            username: 'Admin',
            password: encryptPassword('admin', 'aaaa'),
            salt: 'bbbbb',
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('Users', null, {});
    }
};

function encryptPassword(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};
