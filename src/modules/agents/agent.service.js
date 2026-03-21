const { Op } = require("sequelize");
const { Agent } = require("../../db/models/index");

const agentDTO = require("../agents/agent.dto");
const baseRepository = require("../base/base.repository");
const generateSlug = require("../../utils/generate-slug");
const throwHTTPError = require("../../utils/throw-http-error");

module.exports = {
    getAgents: async (data) => {
        const { rows, ...rest } = await baseRepository.paginate({
            model: Agent,
            page: data.page,
            limit: data.limit
        });

        return agentDTO.getAgentsResponse.parse({ ...rest, agents: rows });
    },

    getAgent: async (data) => {
        const agent = await Agent.findByPk(data.id);
        return agentDTO.getAgentResponse.parse(agent);
    },

    addAgent: async (data) => {
        const slug = generateSlug(data.name);
        
        const agent = await Agent.findOne({
            where: {
                slug,
                userId: data.userId
            }
        });

        if (agent) throwHTTPError({ status: 409, message: "Tên agent đã tồn tại." });

        await Agent.create({
            slug,
            name: data.name,
            userId: data.userId,
            instructions: data.instructions
        });
    },

    updateAgent: async (data) => {
        const agent = await Agent.findByPk(data.id);
        if (!agent) throwHTTPError({ status: 404, message: "Agent không tồn tại." });

        const slug = generateSlug(data.name);

        const duplicateAgent = await Agent.findOne({
            where: {
                slug,
                userId: data.userId,
                id: { [Op.ne]: data.id }
            }
        });

        if (duplicateAgent) throwHTTPError({ status: 409, message: "Tên agent đã tồn tại." });

        await agent.update({
            slug,
            name: data.name,
            instructions: data.instructions
        });
    },

    deleteAgent: async (data) => {
        await Agent.destroy({ where: { id: data.id } });
    }
}