'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Accounts, {
                foreignKey: "userId",
                as: "accounts"
            })
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
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            image: {
                type: DataTypes.TEXT
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