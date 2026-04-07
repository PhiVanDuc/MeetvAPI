const { User, Agent, Meeting } = require("../../db/models/index");

const streamDTO = require("./stream.dto");
const stream =  require("../../libs/stream");
const inngest = require("../../libs/inngest/client");
const throwHTTPError = require("../../utils/throw-http-error");
const boringAvatarsUrl = require("../../utils/boring-avatars-url");

const AI = process.env.AI;
const MEETING_STATUSES = require("../../consts/meeting-statuses");

module.exports = {
    generateToken: async (data) => {
        const user = await User.findByPk(data.userId);
        if (!user) throwHTTPError({ status: 404, message: "Người dùng không tồn tại." });

        await stream.upsertUsers([
            {
                id: user.id,
                role: "admin",
                name: user.name,
                image: boringAvatarsUrl({ name: user.name })
            }
        ]);

        const token = stream.generateUserToken({
            user_id: user.id,
            validity_in_seconds: 3600
        });

        return streamDTO.generateTokenResponse.parse({ token });
    },

    webhook: async (data) => {
        if (!stream.verifyWebhook(data.body, data.signature)) throwHTTPError({ status: 401, message: "Signature không hợp lệ." });

        let payload;
        try { payload = JSON.parse(data.body,toString()); }
        catch(error) { throwHTTPError({ status: 400, message: "JSON không hợp lệ." }) }

        switch(payload.type) {
            case "call.session_started": {
                const meetingId = payload.call.custom?.meetingId;
                if (!meetingId) throwHTTPError({ status: 400, message: "Id cuộc họp không hợp lệ." });

                const meeting = await Meeting.findOne({
                    where: {
                        id: meetingId,
                        status: MEETING_STATUSES.UPCOMING
                    },
                    include: {
                        as: "agent",
                        model: Agent
                    }
                });

                if (!meeting) throwHTTPError({ status: 404, message: "Cuộc họp không tồn tại." });
                if (!meeting.agent) throwHTTPError({ status: 404, message: "Agent không tồn tại." });

                await meeting.update({
                    startedAt: new Date(),
                    status: MEETING_STATUSES.HAPPENING
                });

                try {
                    await fetch(`${AI}/stream/agent/join`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            call_id: meeting.id,
                            call_type: "default",
                            id: meeting.agent.id,
                            name: meeting.agent.name,
                            instructions: meeting.agent.instructions,
                            image: boringAvatarsUrl({ name: meeting.agent.name })
                        })
                    });
                }
                catch (error) { console.error("Lỗi khi gọi api agent join:", error.message); }
                break;
            }
            case "call.session_participant_left": {
                const meetingId = payload.call_cid.split(":")[1];
                if (!meetingId) throwHTTPError({ status: 400, message: "Id cuộc họp không hợp lệ." });

                const call = stream.video.call("default", meetingId);
                await call.end();
                break;
            }
            case "call.session_ended": {
                const meetingId = payload.call.custom?.meetingId;
                if (!meetingId) throwHTTPError({ status: 400, message: "Id cuộc họp không hợp lệ." });

                const meeting = await Meeting.findOne({
                    where: {
                        id: meetingId,
                        status: MEETING_STATUSES.HAPPENING
                    }
                });

                if (!meeting) throwHTTPError({ status: 404, message: "Cuộc họp không tồn tại." });

                await meeting.update({
                    endedAt: new Date(),
                    status: MEETING_STATUSES.PROCESSING
                });
                break;
            }
            case "call.transcription_ready": {
                const meetingId = payload.call_cid.split(":")[1];
                if (!meetingId) throwHTTPError({ status: 400, message: "Id cuộc họp không hợp lệ." });

                const meeting = await Meeting.findByPk(meetingId);
                if (!meeting) throwHTTPError({ status: 404, message: "Cuộc họp không tồn tại." });
                await meeting.update({ transcriptUrl: payload.call_transcription.url });

                await inngest.send({
                    name: "meeting/process",
                    data: {
                        meetingId: meeting.id,
                        transcriptUrl: meeting.transcriptUrl
                    }
                });

                break;
            }
        }
    },

    deleteUsers: async () => {
        const response = await stream.queryUsers({
            payload: {
                filter_conditions: { id: { $ne: "phivanduc" } },
                limit: 100,
            }
        });

        const users = response.users;
        const userIds = users.map(user => user.id);

        await stream.deleteUsers({ 
            user_ids: userIds,
            user: 'hard', 
            messages: 'hard' 
        });
    },

    deleteCalls: async () => {
        const { calls } = await stream.video.queryCalls({
            filter_conditions: {},
            limit: 100,
        });

        if (calls.length > 0) {
            await Promise.all(
                calls.map(({ call }) => {
                    const callInstance = stream.video.call(call.type, call.id);
                    return callInstance.delete({ hard: true });
                })
            );
        }
    }
}