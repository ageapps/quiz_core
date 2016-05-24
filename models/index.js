var path = require("path");


// Usar BBDD SQLite:
//     DATABASE_URL = sqlite: ///
//     DATABASE_STORAGE = quiz.sqlite
// Usar BBDD Postgres:
//     DATABASE_URL = postgres: //user:passwd@host:port/database

// var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
//
// var DATABASE_PROTOCOL = url[1];
// var DATABASE_DIALECT = url[1];
// var DATABASE_USER = url[2];
// var DATABASE_PASSWORD = url[3];
// var DATABASE_HOST = url[4];
// var DATABASE_PORT = url[5];
// var DATABASE_NAME = url[6];
// var DATABASE_STORAGE = process.env.DATABASE_URL;





//./node_modules/.bin/sequelize seed:create --name FillCategorysTable --url sqlite:///quiz.sqlite

var Sequelize = require("sequelize");

// var sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, {
//     dialect: DATABASE_DIALECT,
//     protocol: DATABASE_PROTOCOL,
//     port: DATABASE_PORT,
//     host: DATABASE_HOST,
//     storage: DATABASE_STORAGE,
//     omitNULL: true
// });

var sequelize = new Sequelize(null, null, null, {
    dialect: "sqlite",
    storage: "quiz.sqlite"
});


var Quiz = sequelize.import(path.join(__dirname, "quiz"));

var Comment = sequelize.import(path.join(__dirname, "comment"));

var Category = sequelize.import(path.join(__dirname, "category"));

var User = sequelize.import(path.join(__dirname, "user"));


Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

User.hasMany(Quiz, {foreignKey: 'AuthorId'});
Quiz.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'});

// Quiz.belongsToMany(Category, {
//     through: 'QuizCategories'
// });
// Category.belongsToMany(Quiz, {
//     through: 'QuizCategories'
// });


// sequelize.sync().then(function() {
//     return Quiz.count().then(function(c) {
//         if (c === 0) {
//             return Quiz.bulkCreate([{
//                 question: "Capital de Italia",
//                 answer: "Roma"
//             }, {
//                 question: "Capital de Portugal",
//                 answer: "Lisboa"
//             }]).then(function() {
//                 console.log("Base de datos inicialzada con datos");
//             });
//         }
//     });
// }).catch(function(error) {
//     console.log("Error Sincronizando las tablas de la BD", error);
//     progress.exit(1);
// });

exports.Quiz = Quiz;
exports.Comment = Comment;
exports.Category = Category;
exports.User = User;
