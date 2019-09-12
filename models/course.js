'use strict';
module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('Course', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Sorry ~ Course title is required"
                },
                notNull: {
                    msg: "Sorry ~ Course title is required"
                }
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Sorry ~ Course description is required"
                },
                notNull: {
                    msg: "Sorry ~ Course description is required"
                }
            },
        },
        estimatedTime: {
            type: DataTypes.STRING,
            allowNull: true
        },
        materialsNeeded: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    //  This associates the foreign key for the one-to-one relation with the users 
    Course.associate = function (models) {
        // associations can be defined here
        Course.belongsTo(models.User, {
            as: "user",
            foreignKey: {
                fieldName: "userId",
                allowNull: false
            }
        })
    };
    return Course;
};
