var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                notEmpty: {
                    msg: "Username is missing"
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            set: function(password) {
                this.salt = Math.round((new Date().valueOf() * Math.random())) + '';
                this.setDataValue('password', encryptPassword(password, this.salt));
            },
            validate: {
                notEmpty: {
                    msg: "Answer is missing"
                }
            }
        },
        mail: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                notEmpty: {
                    msg: "Mail is missing"
                }
            }
        },
        foto: {
            type: DataTypes.STRING,
            defaultValue: "/images/profile.png"
        },
        salt: {
            type: DataTypes.STRING,
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        confirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        instanceMethods: {
            verifyPassword: function(password) {
                return encryptPassword(password, this.salt) === this.password;
            }
        }
    });
};
/*
 * Encripts password.
 * Mixes password with salt making a SHA1 digest,
 * returns 40 hexadecimal characters.
 */
function encryptPassword(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};
