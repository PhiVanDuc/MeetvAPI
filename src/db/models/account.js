'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Account extends Model {
        static associate(models) {
            Account.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user"
            })
        }
    }

    Account.init(
        {
            id: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            providerId: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            provider: {
                type: DataTypes.STRING,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING
            }
        },
        {
            sequelize,
            modelName: "Account",
            tableName: "accounts",
            timestamps: true,
            underscored: true
        }
    );
    return Account;
};