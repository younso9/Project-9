//"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },


      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'First Name is needed' },
        },
      },
    
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Last Name is needed' },
        },
      },

      emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        //notEmpty is validate, custom error message shown on the respective form
        validate: {
          isEmail: { msg: 'Please provide a valid e-mail address' },
          notEmpty: { msg: 'E-mail should not be empty' },
        },
      },
    },
      password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Please provide a password' },
      },
    },

  usersRoute.associate = (models) => {
    usersRoute.hasMany(models.Courses);
    },
   
  return usersRoute;
};
