'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('verifications', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            identifier: {
                type: Sequelize.STRING,
                allowNull: false
            },
            value: {
                type: Sequelize.STRING,
                allowNull: false
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false
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
        await queryInterface.dropTable('verifications');
    }
};