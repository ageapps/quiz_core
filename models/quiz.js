module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Quiz', {
        question: {
            type: DataTypes.STRING,
            validate:{ notEmpty: {msg: "Question is missing"}}
        },
        answer: {
            type: DataTypes.STRING,
              validate:{ notEmpty: {msg: "Answer is missing"}}
        }
    });
};
