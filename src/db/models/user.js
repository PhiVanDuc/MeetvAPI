'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Account, {
                foreignKey: "userId",
                as: "accounts"
            });

            User.hasMany(models.Agent, {
                foreignKey: "userId",
                as: "agents"
            });

            User.hasMany(models.Meeting, {
                foreignKey: "userId",
                as: "meetings"
            });

            User.hasOne(models.Subscription, {
                foreignKey: "userId",
                as: "subscription"
            });
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            serviceCustomerId: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                unique: true
            }
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            timestamps: true,
            underscored: true
        }
    );
    
    return User;
};