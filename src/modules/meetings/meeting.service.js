const { Op, Sequelize } = require("sequelize");
const { User, Agent, Meeting } = require("../../db/models/index");

const meetingDTO = require("./meeting.dto");
const stream =  require("../../libs/stream");
const JSONL = require("jsonl-parse-stringify");
const inngest = require("../../libs/inngest/client");
const baseRepository = require("../base/base.repository");
const formatFilter = require("../../utils/format-filter");
const summarizer = require("../../libs/inngest/summarizer");
const throwHTTPError = require("../../utils/throw-http-error");
const boringAvatarsUrl = require("../../utils/boring-avatars-url");

const AI = process.env.AI;
const MEETING_STATUSES = require("../../consts/meeting-statuses");

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
                },
                attributes: {
                    include: [[
                        Sequelize.literal(`
                            CASE 
                                WHEN ended_at > started_at 
                                THEN EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER 
                                ELSE NULL 
                            END    
                        `),
                        'duration'
                    ]]
                }
            }
        });

        const plainRows = rows.map(row => row.get({ plain: true }));
        const countMeeting = await Meeting.count({ where: { userId: data.userId }, limit: 1 });
        return meetingDTO.getMeetingsResponse.parse({ ...rest, createdMeeting: countMeeting > 0, meetings: plainRows });
    },

    getMeeting: async (data) => {
        const meeting = await Meeting.findByPk(
            data.id,
            {
                include: {
                    model: Agent,
                    as: "agent"
                },
                attributes: {
                    include: [[
                        Sequelize.literal(`
                            CASE 
                                WHEN ended_at > started_at 
                                THEN EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER 
                                ELSE NULL 
                            END    
                        `),
                        'duration'
                    ]]
                }
            }
        );

        return meetingDTO.getMeetingResponse.parse(meeting.get({ plain: true }));
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

        await stream.upsertUsers([
            {
                id: user.id,
                role: "admin",
                name: user.name,
                image: boringAvatarsUrl({ name: user.name })
            },
            {
                id: agent.id,
                role: "user",
                name: agent.name,
                image: boringAvatarsUrl({ name: agent.name })
            }
        ]);

        const call = stream.video.call("default", createdMeeting.id);

        await call.create({
            data: {
                created_by_id: user.id,
                custom: {
                    meetingId: createdMeeting.id,
                    meetingName: createdMeeting.name
                },
                settings_override: {
                    transcription: {
                        mode: "auto-on",
                        language: "auto",
                        closed_caption_mode: "auto-on"
                    }
                }
            }
        });
    },

    updateMeeting: async (data) => {
        const meeting = await Meeting.findByPk(data.id);
        if (!meeting) throwHTTPError({ status: 404, message: "Cuộc họp không tồn tại." });

        const agent = await Agent.findByPk(data.agentId);
        if (!agent) throwHTTPError({ status: 404, message: "Agent không tồn tại." });

        const duplicateMeeting = await Meeting.findOne({
            where: {
                name: data.name,
                userId: data.userId,
                id: { [Op.ne]: meeting.id }
            }
        });

        if (duplicateMeeting) throwHTTPError({ status: 409, message: "Tên cuộc họp đã tồn tại." });

        await meeting.update({
            name: data.name,
            agentId: agent.id
        });

        await stream.upsertUsers([
            {
                id: agent.id,
                role: "user",
                name: agent.name,
                image: boringAvatarsUrl({ name: agent.name })
            }
        ]);
    },

    deleteMeeting: async (data) => {
        await Meeting.destroy({ where: { id: data.id } });

        const call = stream.video.call('default', data.id);
        try { await call.delete({ hard: true }); } catch(error) { /* Không làm gì cả. */ }
    },

    generateStreamToken: async (data) => {
        const token = stream.generateUserToken({
            user_id: data.userId,
            validity_in_seconds: 3600
        });

        return meetingDTO.generateStreamTokenResponse.parse({ token });
    },

    processMeeting: inngest.createFunction(
        {
            id: "meeting/process",
            triggers: [{ event: "meeting/process" }]
        },
        async ({ event, step }) => {
            const response = await step.run(
                "fetch-transcript",
                async () => fetch(event.data.transcriptUrl).then(res => res.text())
            );
            
            const transcript = await step.run(
                "parse-transcript",
                async () => JSONL.default.parse(response)
            );

            const transcriptWithSpeakers = await step.run(
                "add-speakers",
                async () => {
                    const speakerIds = [
                        ...new Set(
                            transcript.map(item => item.speaker_id)
                        )
                    ];

                    const userSpeakers = await User.findAll({
                        where: {
                            id: { [Op.in]: speakerIds }
                        }
                    })
                    .then(users => users.map(user => user.get({ plain: true })));
            
                    const agentSpeakers = await Agent.findAll({
                        where: {
                            id: { [Op.in]: speakerIds }
                        }
                    })
                    .then(agents => agents.map(agent => agent.get({ plain: true })));
            
                    const speakers = [
                        ...userSpeakers,
                        ...agentSpeakers
                    ];

                    return transcript.map(item => {
                        const speaker = speakers.find(speaker => speaker.id === item.speaker_id);

                        if (!speaker) return { ...item, user: { name: "Unknown" } }
                        return { ...item, user: { name: speaker.name } }
                    });
                }
            );

            const { output } = await step.run(
                "summary",
                async () => await summarizer.run(`Summarize the following transcript: ${JSON.stringify(transcriptWithSpeakers)}`)
            );

            await step.run(
                "save-summary",
                async () => {
                    await Meeting.update(
                        {
                            summary: output[0].content,
                            status: MEETING_STATUSES.COMPLETED
                        },
                        { where: { id: event.data.meetingId } }
                    )
                }
            );
        }
    ),

    triggerStreamWebhook: async (data) => {
        if (!stream.verifyWebhook(data.body, data.signature)) throwHTTPError({ status: 401, message: "Signature không hợp lệ." });

        let payload;
        try { payload = JSON.parse(data.body.toString()); }
        catch(error) { throwHTTPError({ status: 400, message: "JSON không hợp lệ." }) }

        switch(payload.type) {
            case "call.session_started": {
                const meetingId = payload.call.custom?.meetingId;
                if (!meetingId) throwHTTPError({ status: 400, message: "Id cuộc họp không hợp lệ." });

                const meeting = await Meeting.findByPk(meetingId, {
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
                }).catch(error => error);

                break;
            }
            case "call.session_participant_left": {
                const meetingId = payload.call_cid.split(":")[1];
                if (!meetingId) throwHTTPError({ status: 400, message: "Id cuộc họp không hợp lệ." });

                if (payload.participant?.user?.role === "admin") {
                    const call = stream.video.call("default", meetingId);
                    await call.end();
                }

                break;
            }
            case "call.session_ended": {
                const meetingId = payload.call.custom?.meetingId;
                if (!meetingId) throwHTTPError({ status: 400, message: "Id cuộc họp không hợp lệ." });

                const meeting = await Meeting.findByPk(meetingId);
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

    getMeetingTranscript: async (data) => {
        const meeting = await Meeting.findByPk(data.id);
        if (!meeting) throwHTTPError({ status: 404, message: "Cuộc họp không tồn tại." });
        if (!meeting.transcriptUrl) return [];

        const transcript = await fetch(meeting.transcriptUrl)
            .then(res => res.text())
            .then(text => JSONL.default.parse(text))
            .catch(() => []);

        const speakerIds = [
            ...new Set(
                transcript.map(item => item.speaker_id)
            )
        ];

        const userSpeakers = await User.findAll({
            where: {
                id: { [Op.in]: speakerIds }
            }
        }).then(users => users.map(user => user.get({ plain: true })));

        const agentSpeakers = await Agent.findAll({
            where: {
                id: { [Op.in]: speakerIds }
            }
        }).then(agents => agents.map(agent => agent.get({ plain: true })));

        const speakers = [
            ...userSpeakers,
            ...agentSpeakers
        ];

        const transcriptWithSpeakers = transcript.map(item => {
            const speaker = speakers.find(speaker => speaker.id === item.speaker_id);

            if (!speaker) return { ...item, user: { name: "Unknown" } }
            return { ...item, user: { name: speaker.name } }
        });

        return meetingDTO.getMeetingTranscriptResponse.parse({ transcript: transcriptWithSpeakers });
    },

    deleteStreamUsers: async () => {
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

    deleteStreamCalls: async () => {
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