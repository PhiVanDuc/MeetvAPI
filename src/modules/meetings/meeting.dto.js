const z = require("zod");

const MEETING_STATUSES = require("../../consts/meeting-statuses");

module.exports = {
    getMeetingsRequest: z.object({
        page: z
            .coerce
            .number()
            .int()
            .min(1)
            .catch(1),
        limit: z
            .coerce
            .number()
            .int()
            .min(20)
            .max(100)
            .catch(20),
        name: z
            .string({ error: "Tên cuộc họp cần phải là chuỗi." })
            .nullable()
            .optional(),
        status: z
            .enum(Object.values(MEETING_STATUSES) ,{ error: "Trạng thái cuộc họp không hợp lệ." })
            .nullable()
            .optional()
    }),

    getMeetingsResponse: z.object({
        pagination: z.object({
            page: z
                .number()
                .int()
                .min(1)
                .catch(1),
            limit: z
                .number()
                .int()
                .min(20)
                .max(100)
                .catch(20)
                .transform(value => value.toString()),
            totalPages: z
                .number()
                .int()
                .min(1)
                .catch(1)
                .transform(value => value.toString())
        }),
        createdMeeting: z
            .boolean({ error: "Người dùng đã tạo cuộc họp hay chưa cần phải là boolean." }),
        meetings: z
            .array(
                z.object({
                    id: z
                        .uuidv4({ error: "Id cuộc họp không hợp lệ." }),
                    agent: z.object({
                        id: z
                            .uuidv4({ error: "Id agent không hợp lệ." }),
                        name: z
                            .string({ error: "Tên agent cần phải là chuỗi." }),
                        createdAt: z
                            .date({ error: "Thời gian tạo agent cần phải là đối tượng thời gian." })
                    }),
                    name: z
                        .string({ error: "Tên cuộc họp cần phải là chuỗi." }),
                    status: z
                        .string({ error: "Trạng thái cuộc họp không hợp lệ." }),
                    startedAt: z
                        .date({ error: "Thời gian bắt đầu cuộc họp cần phải là đối tượng thời gian." }),
                    endedAt: z
                        .date({ error: "Thời gian kết thúc cuộc họp cần phải là đối tượng thời gian." }),
                    transcriptURL: z
                        .string({ error: "Đường dẫn bản ghi văn bản cuộc họp cần phải là chuỗi." }),
                    recordingURL: z
                        .string({ error: "Đường dẫn video cuộc họp cần phải là chuỗi." }),
                    summary: z
                        .string({ error: "Bản tóm tắt cuộc họp cần phải là chuỗi." })
                })
            )
    }),

    getMeetingRequest: z.object({
        id: z
            .uuidv4({ error: "Id cuộc họp không hợp lệ." })
    }),

    getMeetingResponse: z.object({
        id: z
            .uuidv4({ error: "Id cuộc họp không hợp lệ." }),
        agent: z.object({
            name: z
                .string({ error: "Tên agent cần phải là chuỗi." }),
            createdAt: z
                .date({ error: "Thời gian tạo agent cần phải là đối tượng thời gian." })
        }),
        name: z
            .string({ error: "Tên cuộc họp cần phải là chuỗi." }),
        status: z
            .enum(Object.values(MEETING_STATUSES) ,{ error: "Trạng thái cuộc họp không hợp lệ." }),
        startedAt: z
            .date({ error: "Thời gian bắt đầu cuộc họp cần phải là đối tượng thời gian." }),
        endedAt: z
            .date({ error: "Thời gian kết thúc cuộc họp cần phải là đối tượng thời gian." }),
        transcriptURL: z
            .string({ error: "Đường dẫn bản ghi văn bản cuộc họp cần phải là chuỗi." }),
        recordingURL: z
            .string({ error: "Đường dẫn video cuộc họp cần phải là chuỗi." }),
        summary: z
            .string({ error: "Bản tóm tắt cuộc họp cần phải là chuỗi." })
    }),

    addMeetingRequest: z.object({
        name: z
            .string({ error: "Tên cuộc họp cần phải là chuỗi." })
            .trim()
            .min(1, { error: "Tên cuộc họp không thể để trống." }),
        agentId: z
            .uuid({ error: "Id agent không hợp lệ." }),
    }),

    updateMeetingRequest: z.object({
        id: z
            .uuid({ error: "Id cuộc họp không hợp lệ." }),
        name: z
            .string({ error: "Tên cuộc họp cần phải là chuỗi." })
            .trim()
            .min(1, { error: "Tên cuộc họp không thể để trống." }),
        agentId: z
            .uuid({ error: "Id agent không hợp lệ." }),
    }),

    deleteMeetingRequest: z.object({
        id: z
            .uuidv4({ error: "Id cuộc họp không hợp lệ." })
    })
}