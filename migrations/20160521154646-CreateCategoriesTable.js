'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('Categories', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            text: {
                type: Sequelize.STRING,
                validate: {
                    notEmpty: {
                        msg: "Category is missing"
                    }
                }
            },
            description: {
                type: Sequelize.STRING
            },
            icon: {
                type: Sequelize.STRING
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
        return queryInterface.dropTable('Categories');
    }
};
