'use strict';

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
           
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Course title is needed' },
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Course title is needed' },
            },
        },

        estimatedTime: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        materialsNeeded: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    });
     

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