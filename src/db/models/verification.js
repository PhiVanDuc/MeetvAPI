'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Verification extends Model {
        static associate(models) {}
    }

    Verification.init(
        {
            id: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            identifier: {
                type: DataTypes.STRING,
                allowNull: false
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Verification",
            tableName: "verifications",
            timestamps: true,
            underscored: true
        }
    );
    return Verification;
};