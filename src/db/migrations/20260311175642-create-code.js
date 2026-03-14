'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('codes', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            identifier: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            code: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            payload: {
                type: Sequelize.TEXT
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            type: {
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
        await queryInterface.dropTable('codes');
    }
};