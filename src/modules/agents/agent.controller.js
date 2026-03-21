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

    getAgent: async (req, res, next) => {
        try {
            const params = req.params;
            const data = agentDTO.getAgentRequest.parse(params);

            const responseData = await agentService.getAgent(data);

            return res.status(200).json({
                message: "Lấy ra agent thành công.",
                data: responseData
            })
        }
        catch (error) { next(error); }
    },

    addAgent: async (req, res, next) => {
        try {
            const body = req.body;
            const { id: userId } = req.user;
            const data = agentDTO.addAgentRequest.parse({ userId, ...body });

            await agentService.addAgent(data);
            return res.status(201).json({ message: "Thêm agent thành công." });
        }
        catch(error) { next(error); }
    },

    updateAgent: async (req, res, next) => {
        try {
            const body = req.body;
            const params = req.params;
            const { id: userId } = req.user;
            const data = agentDTO.updateAgentRequest.parse({ userId, ...body, ...params });

            await agentService.updateAgent(data);
            return res.status(200).json({ message: "Cập nhật agent thành công." });
        }
        catch(error) { next(error); }
    },

    deleteAgent: async (req, res, next) => {
        try {
            const params = req.params;
            const data = agentDTO.deleteAgentRequest.parse(params);

            await agentService.deleteAgent(data);
            return res.status(200).json({ message: "Xoá agent thành công." });
        }
        catch(error) { next(error); }
    }
}