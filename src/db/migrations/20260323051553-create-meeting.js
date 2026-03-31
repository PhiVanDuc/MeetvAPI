'use strict';

/** @type {import('sequelize-cli').Migration} */

const MEETING_STATUSES = require("../../consts/meeting-statuses");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('meetings', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            agent_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "agents",
                    key: "id"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            name: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: MEETING_STATUSES.UPCOMING
            },
            started_at: {
                type: Sequelize.DATE
            },
            ended_at: {
                type: Sequelize.DATE
            },
            transcript_url: {
                type: Sequelize.TEXT
            },
            recording_url: {
                type: Sequelize.TEXT
            },
            summary: {
                type: Sequelize.TEXT
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('meetings');
    }
};