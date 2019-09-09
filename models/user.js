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
            msg: "Sorry - FirstName is required"
          },
          notNull: {
            msg: "Sorry - FirstName is required"
          }
        },
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "Sorry - LastName is required"
          },
          notNull: {
            msg: "Sorry - LastName is required"
          }
        },
        allowNull: false
      },
      emailAddress: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "Sorry - an emailAddress is required"
          },
          notNull: {
            msg: "Sorry - an emailAddress is required"
          },
          isEmail: {
            msg: "Sorry - That is not valid email"
          }
        },
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "So Sorry - password is required"
          },
          notNull: {
            msg: "So Sorry - password is required"
          }
        },
        allowNull: false
      }
    },
    {}
    );
    // This is forming an association between the 2 tables (Users and Courses)
    User.associate = function(models) {
        User.hasMany(models.Course);
    };
  return User;
};
