const { z } = require("zod");

module.exports = {
    getUsageResponse: z.object({
        agentUsage: z
            .number({ error: "Dữ liệu sử dụng agent cần phải là số." }),
        meetingUsage: z
            .number({ error: "Dữ liệu sử dụng cuộc họp cần phải là số." })
    })
}