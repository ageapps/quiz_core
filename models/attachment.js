module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Attachment', {
        public_id: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "public_id is missing"
                }
            }
        },
        url: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "url is missing"
                }
            }
        },
        filename: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "filename is missing"
                }
            }
        },
        mime: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "filename is missing"
                }
            }
        }
    });
};
