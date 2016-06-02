'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.addColumn('Users',
            'confirmed', {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        );
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn('Users', "confirmed");
    }
};
