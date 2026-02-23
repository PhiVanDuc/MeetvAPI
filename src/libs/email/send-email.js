const otpTemplate = require("./templates/otp");
const transporter = require("../../configs/transporter");
const EMAIL_TEMPLATE = require("../../consts/email-templates");

module.exports = async ({ emailTemplate, emailTo, data }) => {
    try {
        let content = { subject: "", html: "" };

        switch (emailTemplate) {
            case EMAIL_TEMPLATE.OTP:
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