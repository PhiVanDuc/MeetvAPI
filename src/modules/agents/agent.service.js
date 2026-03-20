const { User, Agent } = require("../../db/models/index");

const agentDTO = require("../agents/agent.dto");
const baseRepository = require("../base/base.repository");
const generateSlug = require("../../utils/generate-slug");
const throwHTTPError = require("../../utils/throw-http-error");

module.exports = {
    getAgents: async (data) => {
        const { rows, ...rest } = await baseRepository.paginate({
            model: Agent,
            page: data.page,
            limit: data.limit,
            options: { attributes: ["id", "name", "slug", "instructions"] }
        });

        return agentDTO.getAgentsResponse.parse({ ...rest, agents: rows });
    },

    addAgent: async (data) => {
        const user = await User.findByPk(data.userId);
        if (!user) throwHTTPError({ status: 404, message: "Người dùng không tồn tại." });

        const slug = generateSlug(data.name);
        
        const agent = await Agent.findOne({
            where: {
                slug,
                userId: data.userId
            }
        });

        if (agent) throwHTTPError({ status: 409, message: "Tên của agent đã tồn tại." });

        await Agent.create({
            slug,
            name: data.name,
            userId: data.userId,
            instructions: data.instructions
        });
    }
}