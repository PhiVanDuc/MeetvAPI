'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Account extends Model {
        static associate(models) {
            Account.belongsTo(models.User, {
                foreignKey: "userid"
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
            provider: {
                type: DataTypes.STRING,
                allowNull: false
            },
            providerAccountId: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING
            },
            otp: {
                type: DataTypes.TEXT
            },
            otpType: {
                type: DataTypes.STRING
            },
            otpExpiresAt: {
                type: DataTypes.DATE
            }
        }, {
            sequelize,
            modelName: "Account",
            tableName: "accounts",
            timestamps: true,
            underscored: true
        }
    );
    
    return Account;
};