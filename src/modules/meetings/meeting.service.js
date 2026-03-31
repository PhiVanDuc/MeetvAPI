const { Op } = require("sequelize");
const { User, Agent, Meeting } = require("../../db/models/index");

const meetingDTO = require("./meeting.dto");
const streamVideo =  require("../../libs/stream-video");
const baseRepository = require("../base/base.repository");
const formatFilter = require("../../utils/format-filter");
const throwHTTPError = require("../../utils/throw-http-error");

module.exports = {
    getMeetings: async (data) => {
        const filter = formatFilter({
            name: data?.name,
            status: data?.status
        });

        const where = {};
        if (filter?.status) where.status = filter.status;
        if (filter?.name) where.name = { [Op.iLike]: `%${filter?.name}%` }

        const { rows, ...rest } = await baseRepository.paginate({
            model: Meeting,
            page: data.page,
            limit: data.limit,
            options: {
                where,
                include: {
                    model: Agent,
                    as: "agent"
                }
            }
        });

        const countMeeting = await Meeting.count({
            where: { userId: data.userId },
            limit: 1
        });

        return meetingDTO.getMeetingsResponse.parse({ ...rest, createdMeeting: countMeeting > 0, meetings: rows });
    },

    getMeeting: async (data) => {
        const meeting = await Meeting.findByPk(
            data.id,
            {
                include: {
                    model: Agent,
                    as: "agent"
                }
            }
        );

        return meetingDTO.getMeetingResponse.parse(meeting);
    },

    addMeeting: async (data) => {
        const user = await User.findByPk(data.userId);
        if (!user) throwHTTPError({ status: 404, message: "Người dùng không tồn tại." });

        const agent = await Agent.findByPk(data.agentId);
        if (!agent) throwHTTPError({ status: 404, message: "Agent không tồn tại." });

        const meeting = await Meeting.findOne({
            where: {
                name: data.name,
                userId: data.userId
            }
        });

        if (meeting) throwHTTPError({ status: 409, message: "Tên cuộc họp đã tồn tại." });

        const createdMeeting = await Meeting.create({
            name: data.name,
            userId: user.id,
            agentId: agent.id,
        });

        const call = streamVideo.video.call("default", createdMeeting.id);

        await call.create({
            data: {
                created_by_id: user.id,
                custom: {
                    meetingId: createdMeeting.id,
                    meetingName: createdMeeting.name
                },
                settings_override: {
                    transcription: {
                        language: "en",
                        mode: "auto-on",
                        closed_caption_mode: "auto-on"
                    }
                }
            }
        });

        await streamVideo.upsertUsers([
            {
                id: agent.id,
                name: agent.name
            }
        ]);
    },

    updateMeeting: async (data) => {
        const user = await User.findByPk(data.userId);
        if (!user) throwHTTPError({ status: 404, message: "Người dùng không tồn tại." });

        const agent = await Agent.findByPk(data.agentId);
        if (!agent) throwHTTPError({ status: 404, message: "Agent không tồn tại." });

        const meeting = await Meeting.findByPk(data.id);
        if (!meeting) throwHTTPError({ status: 404, message: "Cuộc họp không tồn tại." });

        const duplicateMeeting = await Meeting.findOne({
            where: {
                name: data.name,
                userId: user.id,
                id: { [Op.ne]: meeting.id }
            }
        });

        if (duplicateMeeting) throwHTTPError({ status: 409, message: "Tên cuộc họp đã tồn tại." });

        await meeting.update({
            name: data.name,
            agentId: agent.id
        });
    },

    deleteMeeting: async (data) => {
        await Meeting.destroy({ where: { id: data.id } });

        const call = streamVideo.video.call("default", data.id);
        if (call) await call.delete({ hard: true });
    },

    generateUserVideoToken: async (data) => {
        const user = await User.findByPk(data.userId);
        if (!user) throwHTTPError({ status: 404, message: "Người dùng không tồn tại." });

        await streamVideo.upsertUsers([
            {
                id: user.id,
                name: user.name,
                role: "admin"
            }
        ]);

        const token = streamVideo.generateUserToken({
            user_id: user.id,
            validity_in_seconds: 3600
        });

        return meetingDTO.generateUserVideoTokenResponse.parse({ token });
    }
}