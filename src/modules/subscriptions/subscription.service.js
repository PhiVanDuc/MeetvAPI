const { Agent, Meeting } = require("../../db/models/index");

const subscriptionDTO = require("./subscription.dto");

module.exports = {
    getUsage: async (data) => {
        const [agentUsage, meetingUsage] = await Promise.all([
            Agent.count({ where: { userId: data.userId } }),
            Meeting.count({ where: { userId: data.userId } })
        ]);

        return subscriptionDTO.getUsageResponse.parse({ agentUsage, meetingUsage });
    }
}