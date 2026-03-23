'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Agent extends Model {
        static associate(models) {
            Agent.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user"
            });

            Agent.hasMany(models.Meeting, {
                foreignKey: "agentId",
                as: "meetings"
            });
        }
    }

    Agent.init(
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
            name: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            instructions: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: "Agent",
            tableName: "agents",
            timestamps: true,
            underscored: true
        }
    );

    return Agent;
};