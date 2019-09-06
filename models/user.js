"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      firstName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "firstName is required"
          },
          notNull: {
            msg: "firstName is required"
          }
        },
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "lastName is required"
          },
          notNull: {
            msg: "lastName is required"
          }
        },
        allowNull: false
      },
      emailAddress: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "emailAddress is required"
          },
          notNull: {
            msg: "emailAddress is required"
          },
          isEmail: {
            msg: "not valid email"
          }
        },
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "password is required"
          },
          notNull: {
            msg: "password is required"
          }
        },
        allowNull: false
      }
    },
    {}
    );
    //Forming the association between the 2 tables (Users and Courses)
    User.associate = function(models) {
        // associations can be defined here
        User.hasMany(models.Course);
    };
  return User;
};
