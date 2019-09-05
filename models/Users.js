'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: {
            type: DataTypes.STRING,
            //notEmpty is validate, custom error message shown on the respective form
            validate: {
                notEmpty: {
                    msg: "Title cannot be empty."
                }
            },
        },
        lastName: {
            type: DataTypes.STRING,
            //notEmpty is validate, custom error message shown on the respective form
            validate: {
                notEmpty: {
                    msg: "Author cannot be empty."
                }
            },
        },
        emailAddress: {
            type: DataTypes.STRING,
            //notEmpty is validate, custom error message shown on the respective form
            validate: {
                notEmpty: {
                    msg: "Author cannot be empty."
                }
            },
        },
        password: {
            type: DataTypes.STRING,
            //notEmpty is validate, custom error message shown on the respective form
            validate: {
                notEmpty: {
                    msg: "Author cannot be empty."
                }
            },
        },
       
    }, {sequelize});
    User.associate = (models) => {
        User.hasMany(models.Course);
    };
    return User;
};