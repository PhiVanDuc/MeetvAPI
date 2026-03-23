'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Meeting extends Model {
        static associate(models) {
            Meeting.belongsTo(models.Agent, {
                foreignKey: "agentId",
                as: "agent"
            });

            Meeting.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user"
            });
        }
    }

    Meeting.init(
        {
            id: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            agentId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false
            },
            startedAt: {
                type: DataTypes.DATE
            },
            endedAt: {
                type: DataTypes.DATE
            },
            transcriptURL: {
                type: DataTypes.TEXT
            },
            recordingURL: {
                type: DataTypes.TEXT
            },
            summary: {
                type: DataTypes.TEXT
            }
        },
        {
            sequelize,
            modelName: "Meeting",
            tableName: "meetings",
            timestamps: true,
            underscored: true
        }
    );
    return Meeting;
};