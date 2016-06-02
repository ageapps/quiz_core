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
            description: "Places, countries, capitals ...",
            icon: "glyphicon glyphicon-globe",
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Entertainment',
            description: "Free time, hobbies, partys ... ",
            icon: "glyphicon glyphicon-glass",
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Science',
            description: "Maths, physics, chemistry ... ",
            icon: "glyphicon glyphicon-education",
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Literature',
            description: "Novels, authors, magazines ... ",
            icon: "glyphicon glyphicon-book",
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'History',
            description: "Heroes, tales, wars ... ",
            icon: "glyphicon glyphicon-tower",
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Sports',
            description: "Football, basketball, swimming ... ",
            icon: "glyphicon glyphicon-play-circle",
            createdAt: new Date(),
            updatedAt: new Date()
        },{
            text: 'Movies',
            description: "Film directors, actors, series ... ",
            icon: "glyphicon glyphicon-film",
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Music',
            description: "Artists, songs, concerts ... ",
            icon: "glyphicon glyphicon-music",
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Gaming',
            description: "Games, online, guides ... ",
            icon: "glyphicon glyphicon-knight",
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Food',
            description: "Dishes, restaurants, desserts ... ",
            icon: "glyphicon glyphicon-cutlery",
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            text: 'Other',
            description: "Artists, songs, concerts ... ",
            icon: "glyphicon glyphicon-new-window",
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
