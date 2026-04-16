'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Subcription extends Model {
        static associate(models) {
            Subcription.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user"
            });
        }
    }
    
    Subcription.init(
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
            serviceSubcriptionId: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            servicePriceId: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            currentPeriodStart: {
                type: DataTypes.DATE,
                allowNull: false
            },
            currentPeriodEnd: {
                type: DataTypes.DATE,
                allowNull: true
            }
        }, 
        {
            sequelize,
            modelName: "Subcription",
            tableName: "subcriptions",
            underscored: true,
            timestamps: true
        }
    );
    
    return Subcription;
};