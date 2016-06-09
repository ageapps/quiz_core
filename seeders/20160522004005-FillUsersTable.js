'use strict';

var crypto = require('crypto');

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('Users', [{
            username: 'admin',
            password: encryptPassword('admin', 'aaaa'),
            mail: 'age.quiz@gmail.com',
            salt: 'aaaa',
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            confirmed: true
        }, {
            username: 'Admin',
            password: encryptPassword('admin', 'aaaa'),
            mail: "adrian.gespinosa@gmail.com",
            salt: 'bbbbb',
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            confirmed: true
        }, {
            username: 'pepe',
            password: encryptPassword('pepe', 'aaaa'),
            mail: "pepe@gmail.com",
            salt: 'ccccc',
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            confirmed: true
        }, {
            username: 'jose',
            password: encryptPassword('jose', 'aaaa'),
            mail: "jose@gmail.com",
            salt: 'ddddd',
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            confirmed: true
        }, {
            username: 'juan',
            password: encryptPassword('juan', 'aaaa'),
            mail: "juan@gmail.com",
            salt: 'eeeee',
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            confirmed: true
        }, {
            username: 'adri',
            password: encryptPassword('adri', 'aaaa'),
            mail: "adri@gmail.com",
            salt: 'fffff',
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

/*
 * Encripts password.
 * Mixes password with salt making a SHA1 digest,
 * returns 40 hexadecimal characters.
 */
function encryptPassword(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};
