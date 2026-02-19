'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('accounts', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id"
                },
                onDelete: "CASCADE"
            },
            provider: {
                type: Sequelize.STRING,
                allowNull: false
            },
            provider_account_id: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            password: {
                type: Sequelize.STRING
            },
            otp: {
                type: Sequelize.TEXT
            },
            otp_type: {
                type: Sequelize.STRING
            },
            otp_expires_at: {
                type: Sequelize.DATE
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('accounts');
    }
};