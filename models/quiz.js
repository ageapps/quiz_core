module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Quiz', {
        question: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Question is missing"
                }
            }
        },
        answer: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Answer is missing"
                }
            }
        },
        category: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Category is missing"
                }
            }
        }
    });
};
