'use strict';

// module.exports = (sequelize, type) => {
//     return sequelize.define('user', {
//         id: {
//             type: type.INTEGER,
//             primaryKey: true,
//             autoIncrement: true
//         },
//         name: type.STRING
//     })
// }

module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('Course', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true
        },
        estimatedTime: {
            type: DataTypes.STRING,
            //notEmpty is validate, custom error message shown on the respective form
            validate: {
                notEmpty: {
                    msg: "Author cannot be empty."
                }
            },
        },
        materialsNeeded: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true
        },
        genre: DataTypes.STRING,
        year: DataTypes.INTEGER
    }, {sequelize});
    Course.associate = (models) => {
        Course.belongsTo(models.User, { 
            foreignKey: {
                fieldName: 'userId', 
                allowNull: false, 
            }
        });
    };
    return Course;
};

// RESOURCES: 