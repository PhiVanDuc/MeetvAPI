'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Subscription extends Model {
        static associate(models) {
            Subscription.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user"
            });
        }
    }

    Subscription.init(
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
                allowNull: false,
                unique: true
            },
            serviceSubscriptionId: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            servicePriceId: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            currentPeriodStart: {
                type: DataTypes.DATE,
                allowNull: true
            },
            currentPeriodEnd: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: "Subscription",
            tableName: "subscriptions",
            underscored: true,
            timestamps: true
        }
    );
    return Subscription;
};