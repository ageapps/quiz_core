module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Comment', {
        text: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Comment is missing"
                }
            }
        },
        accepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
};
// ./node_modules/.bin/sequelize migration:create --name AddAcceptedToCommentsTable --url sqlite://$(pwd)/quiz.sqlite
