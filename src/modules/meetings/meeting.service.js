const { Op } = require("sequelize");
const { Agent, Meeting } = require("../../db/models/index");

const meetingDTO = require("./meeting.dto");
const baseRepository = require("../base/base.repository");
const formatFilter = require("../../utils/format-filter");

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
        const meeting = await Meeting.findOne({
            where: {
                name: data.name,
                userId: data.userId
            }
        });

        if (meeting) throwHTTPError({ status: 409, message: "Tên cuộc họp đã tồn tại." });

        await Meeting.create({
            name: data.name,
            userId: data.userId,
            agentId: data.agentId,
        });
    },

    updateMeeting: async (data) => {
        const meeting = await Meeting.findByPk(data.id);
        if (!meeting) throwHTTPError({ status: 404, message: "Cuộc họp không tồn tại." });

        const duplicateMeeting = await Meeting.findOne({
            where: {
                name: data.name,
                userId: data.userId,
                id: { [Op.ne]: data.id }
            }
        });

        if (duplicateMeeting) throwHTTPError({ status: 409, message: "Tên cuộc họp đã tồn tại." });

        await meeting.update({
            name: data.name,
            agentId: data.agentId
        });
    },

    deleteMeeting: async (data) => {
        await Meeting.destroy({ where: { id: data.id } });
    }
}