'use strict';

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */

module.exports = {
    async up(queryInterface, Sequelize) {
        const agents = [];

        for (let i = 1; i <= 60; i++) {
            agents.push({
                id: uuidv4(),
                user_id: "15cd310b-84be-47aa-b7dc-412a3a2f7866",
                name: `Agent ${i}`,
                instructions: `Instructions for agent ${i}`,
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        await queryInterface.bulkInsert('agents', agents, {});
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.bulkDelete('agents', {
            user_id: "15cd310b-84be-47aa-b7dc-412a3a2f7866"
        }, {});
    }
};
