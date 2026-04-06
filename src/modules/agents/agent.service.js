const { Op } = require("sequelize");
const { Agent } = require("../../db/models/index");

const stream =  require("../../libs/stream");
const agentDTO = require("../agents/agent.dto");
const baseRepository = require("../base/base.repository");
const formatFilter = require("../../utils/format-filter");
const throwHTTPError = require("../../utils/throw-http-error");

module.exports = {
    getAgents: async (data) => {
        const filter = formatFilter({ name: data?.name });
        const where = {};

        if (filter?.name) where.name = { [Op.iLike]: `%${filter?.name}%` };

        const { rows, ...rest } = await baseRepository.paginate({
            model: Agent,
            page: data.page,
            limit: data.limit,
            options: { where }
        });

        const countAgent = await Agent.count({
            where: { userId: data.userId },
            limit: 1
        });

        return agentDTO.getAgentsResponse.parse({ ...rest, createdAgent: countAgent > 0, agents: rows });
    },

    getAgent: async (data) => {
        const agent = await Agent.findByPk(data.id);
        return agentDTO.getAgentResponse.parse(agent);
    },

    addAgent: async (data) => {
        const agent = await Agent.findOne({
            where: {
                name: data.name,
                userId: data.userId
            }
        });

        if (agent) throwHTTPError({ status: 409, message: "Tên agent đã tồn tại." });

        await Agent.create({
            name: data.name,
            userId: data.userId,
            instructions: data.instructions
        });
    },

    updateAgent: async (data) => {
        const agent = await Agent.findByPk(data.id);
        if (!agent) throwHTTPError({ status: 404, message: "Agent không tồn tại." });

        const duplicateAgent = await Agent.findOne({
            where: {
                name: data.name,
                userId: data.userId,
                id: { [Op.ne]: data.id }
            }
        });

        if (duplicateAgent) throwHTTPError({ status: 409, message: "Tên agent đã tồn tại." });

        const updatedAgent = await agent.update({
            name: data.name,
            instructions: data.instructions
        });

        await stream.upsertUsers([
            {
                id: updatedAgent.id,
                name: updatedAgent.name,
                image: boringAvatarsUrl({ name: updatedAgent.name })
            }
        ]);
    },

    deleteAgent: async (data) => {
        await Agent.destroy({ where: { id: data.id } });
        stream.deleteUsers({ user_ids: [data.id], user: "hard", messages: "hard" });
    }
}