var path = require("path");

var Sequelize = require("sequelize");


// HEROKU USAGE

// var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
// var DATABASE_PROTOCOL = url[1];
// var DATABASE_DIALECT = url[1];
// var DATABASE_USER = url[2];
// var DATABASE_PASSWORD = url[3];
// var DATABASE_HOST = url[4];
// var DATABASE_PORT = url[5];
// var DATABASE_NAME = url[6];
// var DATABASE_STORAGE = process.env.DATABASE_URL;
//
// var sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, {
//     dialect: DATABASE_DIALECT,
//     protocol: DATABASE_PROTOCOL,
//     port: DATABASE_PORT,
//     host: DATABASE_HOST,
//     storage: DATABASE_STORAGE,
//     omitNULL: true
// });

// LOCAL USAGE

var sequelize = new Sequelize(null, null, null, {
    dialect: "sqlite",
    storage: "quiz.sqlite"
});


var Quiz = sequelize.import(path.join(__dirname, "quiz"));

var Comment = sequelize.import(path.join(__dirname, "comment"));

var Category = sequelize.import(path.join(__dirname, "category"));

var User = sequelize.import(path.join(__dirname, "user"));

var Attachment = sequelize.import(path.join(__dirname, "attachment"));

var Avatar = sequelize.import(path.join(__dirname, "avatar"));



// User - Comment - Quizz relations 1:1:1
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);
Comment.belongsTo(User, {
    as: 'Author',
    foreignKey: 'AuthorId'
});

// User - User relation N:M
User.belongsToMany(User, {
  as: 'Follower',
  through: 'Followers',
  foreignKey: 'FollowedId'
});
User.belongsToMany(User, {
    as: 'Followed',
    through: 'Followers',
    foreignKey: 'FollowerId'
});

// User - Quizz relation 1:N
User.hasMany(Quiz, {
    foreignKey: 'AuthorId'
});
Quiz.belongsTo(User, {
    as: 'Author',
    foreignKey: 'AuthorId'
});

// Category - Quizz relation N:M
Quiz.belongsToMany(Category, {
    through: 'QuizCategories',
    as: "QuizCategories"
});
Category.belongsToMany(Quiz, {
    through: 'QuizCategories',
    as: "QuizesInCategories"
});

// Attachment - Quizz relation 1:1
Attachment.belongsTo(Quiz);
Quiz.hasOne(Attachment);

// Avatar - User relation 1:1
Avatar.belongsTo(User);
User.hasOne(Avatar);


exports.Quiz = Quiz;
exports.Comment = Comment;
exports.Category = Category;
exports.User = User;
exports.Attachment = Attachment;
exports.Avatar = Avatar;
