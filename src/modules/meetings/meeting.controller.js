const meetingDTO = require("./meeting.dto");
const meetingService = require("./meeting.service");

module.exports = {
    getMeetings: async (req, res, next) => {
        try {
            const query = req.query;
            const data = meetingDTO.getMeetingsRequest.parse(query);

            const responseData = await meetingService.getMeetings({ ...data, userId: req.user.id });

            return res.status(200).json({
                message: "Lấy danh sách các cuộc họp thành công.",
                data: responseData
            });
        }
        catch(error) { next(error); }
    },

    getMeeting: async (req, res, next) => {
        try {
            const params = req.params;
            const data = meetingDTO.getMeetingRequest.parse(params);

            const responseData = await meetingService.getMeeting(data);

            return res.status(200).json({
                message: "Lấy cuộc họp thành công.",
                data: responseData
            });
        }
        catch(error) { next(error); }
    },
    
    addMeeting: async (req, res, next) => {
        try {
            const body = req.body;
            const data = meetingDTO.addMeetingRequest.parse(body);

            await meetingService.addMeeting({ ...data, userId: req.user.id });
            return res.status(201).json({ message: "Thêm cuộc họp thành công." });
        }
        catch(error) { next(error); }
    },

    updateMeeting: async (req, res, next) => {
        try {
            const body = req.body;
            const params = req.params;
            const data = meetingDTO.updateMeetingRequest.parse({ ...body, ...params });

            await meetingService.updateMeeting({ ...data, userId: req.user.id });
            return res.status(200).json({ message: "Cập nhật cuộc họp thành công." });
        }
        catch(error) { next(error); }
    },

    deleteMeeting: async (req, res, next) => {
        try {
            const params = req.params;
            const data = meetingDTO.deleteMeetingRequest.parse(params);

            await meetingService.deleteMeeting(data);
            return res.status(200).json({ message: "Xoá cuộc họp thành công." });
        }
        catch(error) { next(error); }
    },

    getMeetingTranscript: async (req, res, next) => {
        try {
            const params = req.params;
            const data = meetingDTO.getMeetingRequest.parse(params);

            const responseData = await meetingService.getMeetingTranscript(data);
            
            return res.status(200).json({
                message: "Lấy ra lời thoại của cuộc họp thành công.",
                data: responseData
            });
        }
        catch(error) { next(error); }
    },

    generateStreamToken: async (req, res, next) => {
        try {
            const responseData = await meetingService.generateStreamToken({ userId: req.user.id });

            return res.status(200).json({
                message: "Tạo stream token thành công.",
                data: responseData
            });
        }
        catch(error) { next(error); }
    },

    triggerStreamWebhook: async (req, res, next) => {
        try {
            await meetingService.triggerStreamWebhook({
                signature: req.get("x-signature"),
                apiKey: req.get("x-api-key"),
                body: req.rawBody
            });
            
            return res.status(200).json({ message: "Tiếp nhận stream webhook thành công!" });
        }
        catch(error) { next(error); }
    },

    deleteStreamUsers: async (req, res, next) => {
        try {
            await meetingService.deleteStreamUsers();
            return res.status(200).json({ message: `Xoá các người dùng stream thành công.` });
        }
        catch(error) { next(error); }
    },

    deleteStreamCalls: async (req, res, next) => {
        try {
            await meetingService.deleteStreamCalls();
            return res.status(200).json({ message: `Xoá các cuộc gọi stream thành công.` });
        }
        catch(error) { next(error); }
    }
}