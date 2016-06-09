'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable(
            'Followers', {
                FollowerId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                FollowedId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
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
        return queryInterface.dropTable('Followers');
    }
};
