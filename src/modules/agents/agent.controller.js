const agentDTO = require("./agent.dto");
const agentService = require("./agent.service");

module.exports = {
    getAgents: async (req, res, next) => {
        try {
            const query = req.query;
            const data = agentDTO.getAgentsRequest.parse(query);

            const responseData = await agentService.getAgents(data);

            return res.status(200).json({
                message: "Lấy danh sách các agent thành công.",
                data: responseData
            });
        }
        catch(error) { next(error); }
    },

    addAgent: async (req, res, next) => {
        try {
            const body = req.body;
            const data = agentDTO.addAgentRequest.parse(body);

            await agentService.addAgent(data);
            return res.status(201).json({ message: "Thêm agent thành công." });
        }
        catch(error) { next(error); }
    }
}