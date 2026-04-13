const { Op, Sequelize } = require("sequelize");
const { User, Agent, Meeting } = require("../../db/models/index");

const meetingDTO = require("./meeting.dto");
const stream =  require("../../libs/stream");
const JSONL = require("jsonl-parse-stringify");
const inngest = require("../../libs/inngest/client");
const baseRepository = require("../base/base.repository");
const formatFilter = require("../../utils/format-filter");
const { createAgent, gemini } = require("@inngest/agent-kit");
const throwHTTPError = require("../../utils/throw-http-error");
const boringAvatarsUrl = require("../../utils/boring-avatars-url");

const MEETING_STATUSES = require("../../consts/meeting-statuses");

const summarizer = createAgent({
    name: "summarizer",
    system: `
        ### CRITICAL LANGUAGE MATCHING
        You MUST identify the language of the transcript and write the entire summary in that SAME LANGUAGE. (e.g., if the transcript is in Spanish, the summary must be in Spanish. If it is in Japanese, the summary must be in Japanese, etc.). This is the most important rule.

        You are an expert summarizer. You write readable, concise, simple content. You are given a transcript of a meeting and you need to summarize it.

        Use the following markdown structure for every output:

        ### Overview
        Provide a detailed, engaging summary of the session's content. Focus on major features, user workflows, and any key takeaways. Write in a narrative style, using full sentences. Highlight unique or powerful aspects of the product, platform, or discussion.

        ### Notes
        Break down key content into thematic sections with timestamp ranges. Each section should summarize key points, actions, or demos in bullet format.

        Example:
        #### Section Name
        - Main point or demo shown here
        - Another key insight or interaction
        - Follow-up tool or explanation provided

        #### Next Section
        - Feature X automatically does Y
        - Mention of integration with Z
    `.trim(),
    model: gemini({
        model: "gemini-3.1-flash-lite-preview",
        apiKey: process.env.GEMINI_API_KEY
    })
});

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
                        Sequelize.literal(`EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER`),
                        'duration'
                    ]]
                }
            }
        });

        const plainRows = rows.map(row => row.get({ plain: true }));

        const countMeeting = await Meeting.count({
            where: { userId: data.userId },
            limit: 1
        });

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
                        Sequelize.literal(`EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER`),
                        'duration'
                    ]]
                }
            }
        );

        if (!meeting) throwHTTPError({ status: 404, message: "Cuộc họp không tồn tại." });
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

        await stream.upsertUsers([
            {
                id: agent.id,
                name: agent.name,
                image: boringAvatarsUrl({ name: agent.name })
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

        const call = stream.video.call('default', data.id);
        try { await call.delete({ hard: true }); } catch(error) {}
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
                    const speakerIds = [...new Set(transcript.map(item => item.speaker_id))];

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
            
                    const speakers = [...userSpeakers, ...agentSpeakers];

                    return transcript.map(item => {
                        const speaker = speakers.find(speaker => speaker.id === item.speaker_id);

                        if (!speaker) {
                            return {
                                ...item,
                                user: { name: "Unknown" }
                            }
                        }

                        return {
                            ...item,
                            user: { name: speaker.name }
                        }
                    })
                }
            );

            const { output } = await summarizer.run(`Summarize the following transcript: ${JSON.stringify(transcriptWithSpeakers)}`);

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
            )
        }
    ),

    getMeetingTranscript: async (data) => {
        const meeting = await Meeting.findByPk(data.id);
        if (!meeting) throwHTTPError({ status: 404, message: "Cuộc họp không tồn tại." });
        if (!meeting.transcriptUrl) return [];

        const transcript = await fetch(meeting.transcriptUrl)
            .then(res => res.text())
            .then(text => JSONL.default.parse(text))
            .catch(() => []);

        const speakerIds = [...new Set(transcript.map(item => item.speaker_id))];

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

        const speakers = [...userSpeakers, ...agentSpeakers];

        const transcriptWithSpeakers = transcript.map(item => {
            const speaker = speakers.find(speaker => speaker.id === item.speaker_id);

            if (!speaker) {
                return {
                    ...item,
                    user: { name: "Unknown" }
                }
            }

            return {
                ...item,
                user: { name: speaker.name }
            }
        });

        return meetingDTO.getMeetingTranscriptResponse.parse({ transcript: transcriptWithSpeakers });
    }
}