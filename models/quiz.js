module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Quiz', {
        question: {
            type: DataTypes.STRING
        },
        answer: {
            type: DataTypes.STRING
        }
    });
};
