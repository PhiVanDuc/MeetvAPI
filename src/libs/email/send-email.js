const transporter = require("../../configs/transporter");
const otpTemplate = require("./templates/otp-template");

module.exports = async ({ emailTemplate, emailTo, data }) => {
    try {
        let content = { subject: "", html: "" };

        switch (emailTemplate) {
            case "otp-template":
                content = otpTemplate(data);
                break;
        }

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: emailTo,
            subject: content.subject,
            html: content.html,
        });
    }
    catch (error) { throw error; }
};