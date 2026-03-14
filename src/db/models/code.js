'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Code extends Model {
        static associate(models) {}
    }
    
    Code.init(
        {
            id: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            identifier: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            code: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            payload: {
                type: DataTypes.TEXT
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Code",
            tableName: "codes",
            timestamps: true,
            underscored: true
        }
    );

    return Code;
};