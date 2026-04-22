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
                        .uuidv4({ error: "Id cuộc họp sai định dạng." }),
                    agent: z.object({
                        id: z
                            .uuidv4({ error: "Id agent sai định dạng." }),
                        name: z
                            .string({ error: "Tên agent cần phải là chuỗi." })
                    }),
                    name: z
                        .string({ error: "Tên cuộc họp cần phải là chuỗi." }),
                    status: z
                        .enum(Object.values(MEETING_STATUSES) ,{ error: "Trạng thái cuộc họp không hợp lệ." }),
                    startedAt: z
                        .date({ error: "Thời gian bắt đầu cuộc họp cần phải là đối tượng thời gian." })
                        .nullable()
                        .optional(),
                    endedAt: z
                        .date({ error: "Thời gian kết thúc cuộc họp cần phải là đối tượng thời gian." })
                        .nullable()
                        .optional(),
                    duration: z
                        .number()
                        .nullable()
                        .optional(),
                    transcriptUrl: z
                        .string({ error: "Đường dẫn bản ghi văn bản cuộc họp cần phải là chuỗi." })
                        .nullable()
                        .optional(),
                    summary: z
                        .string({ error: "Bản tóm tắt cuộc họp cần phải là chuỗi." })
                        .nullable()
                        .optional(),
                })
            )
    }),

    getMeetingRequest: z.object({
        id: z
            .uuidv4({ error: "Id cuộc họp sai định dạng." })
    }),

    getMeetingResponse: z.object({
        id: z
            .uuidv4({ error: "Id cuộc họp sai định dạng." }),
        agent: z.object({
            id: z
                .uuidv4({ error: "Id agent sai định dạng." }),
            name: z
                .string({ error: "Tên agent cần phải là chuỗi." })
        }),
        name: z
            .string({ error: "Tên cuộc họp cần phải là chuỗi." }),
        status: z
            .enum(Object.values(MEETING_STATUSES) ,{ error: "Trạng thái cuộc họp không hợp lệ." }),
        startedAt: z
            .date({ error: "Thời gian bắt đầu cuộc họp cần phải là đối tượng thời gian." })
            .nullable()
            .optional(),
        endedAt: z
            .date({ error: "Thời gian kết thúc cuộc họp cần phải là đối tượng thời gian." })
            .nullable()
            .optional(),
        duration: z
            .number()
            .nullable()
            .optional(),
        transcriptUrl: z
            .string({ error: "Đường dẫn bản ghi văn bản cuộc họp cần phải là chuỗi." })
            .nullable()
            .optional(),
        summary: z
            .string({ error: "Bản tóm tắt cuộc họp cần phải là chuỗi." })
            .nullable()
            .optional(),
    }),

    addMeetingRequest: z.object({
        name: z
            .string({ error: "Tên cuộc họp cần phải là chuỗi." })
            .trim()
            .min(1, { error: "Tên cuộc họp không thể để trống." }),
        agentId: z
            .uuid({ error: "Id agent sai định dạng." }),
    }),

    updateMeetingRequest: z.object({
        id: z
            .uuid({ error: "Id cuộc họp sai định dạng." }),
        name: z
            .string({ error: "Tên cuộc họp cần phải là chuỗi." })
            .trim()
            .min(1, { error: "Tên cuộc họp không thể để trống." }),
        agentId: z
            .uuid({ error: "Id agent sai định dạng." }),
    }),

    deleteMeetingRequest: z.object({
        id: z
            .uuidv4({ error: "Id cuộc họp sai định dạng." })
    }),

    getMeetingTranscriptRequest: z.object({
        id: z
            .uuidv4({ error: "Id cuộc họp sai định dạng." })
    }),

    getMeetingTranscriptResponse: z.object({
        transcript: z.array(
            z.object({
                speaker_id: z
                    .uuidv4({ error: "Id người nói sai định dạng." }),
                type: z
                    .string({ error: "Loại câu thoại cần phải là chuỗi." }),
                text: z
                    .string({ error: "Đoạn văn bản câu thoại cần phải là chuỗi." }),
                start_ts: z
                    .number({ error: "Thời gian bắt đầu câu thoại cần phải là số." }),
                stop_ts: z
                    .number({ error: "Thời gian dừng câu thoại cần phải là số." }),
                user: z.object({
                    name: z
                        .string({ error: "Tên người nói cần phải là chuỗi." })
                })
            })
        )
    }),

    generateStreamTokenResponse: z.object({
        token: z
            .string({ error: "Token người dùng của dịch vụ stream cần phải là chuỗi." })
            .min(1, { error: "Token người dùng của dịch vụ stream không thể để trống." })
    })
}