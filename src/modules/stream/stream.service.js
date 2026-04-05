const { User, Agent, Meeting } = require("../../db/models/index");

const streamVideoDTO = require("./stream.dto");
const streamVideo =  require("../../libs/stream");
const throwHTTPError = require("../../utils/throw-http-error");
const boringAvatarsUrl = require("../../utils/boring-avatars-url");
const { CallEndedEvent, MessageNewEvent, CallTranscriptionReadyEvent, CallSessionParticipantLeftEvent, CallRecordingReadyEvent, CallSessionStartedEvent } = require("@stream-io/node-sdk");

const MEETING_STATUSES = require("../../consts/meeting-statuses");

module.exports = {
    generateToken: async (data) => {
        const user = await User.findByPk(data.userId);
        if (!user) throwHTTPError({ status: 404, message: "Người dùng không tồn tại." });

        await streamVideo.upsertUsers([
            {
                id: user.id,
                role: "admin",
                name: user.name,
                image: boringAvatarsUrl({ name: user.name })
            }
        ]);

        const token = streamVideo.generateUserToken({
            user_id: user.id,
            validity_in_seconds: 3600
        });

        return streamVideoDTO.generateTokenResponse.parse({ token });
    },

    webhook: async (data) => {
        if (!streamVideo.verifyWebhook(data.body, data.signature)) throwHTTPError({ status: 401, message: "Signature không hợp lệ." });

        let payload;
        try { payload = JSON.parse(data.body,toString()); }
        catch(error) { throwHTTPError({ status: 400, message: "JSON không hợp lệ." }) }

        switch(payload.type) {
            case "call.session_started":
                const meetingId = payload.call.custom?.meetingId;
                if (!meetingId) throwHTTPError({ status: 400, message: "Id cuộc họp không hợp lệ." });

                const meeting = await Meeting.findByPk(meetingId, {
                    where: { status: MEETING_STATUSES.UPCOMING },
                    include: { model: Agent, as: "agent" }
                });

                if (!meeting) throwHTTPError({ status: 404, message: "Cuộc họp không tồn tại." });
                if (!meeting.agent) throwHTTPError({ status: 404, message: "Agent không tồn tại." })
                await meeting.update({ startedAt: new Date() });

                try {
                    await fetch("http://localhost:8000/custom/join", {
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
    }
}