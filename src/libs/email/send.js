const transporter = require("./transporter");
const templateOTP = require("./templates/otp");
const EMAIL_TEMPLATE = require("../../consts/email-templates");

module.exports = async ({ template, to, data }) => {
    try {
        let content = {
            html: "",
            subject: ""
        }

        switch (template) {
            case EMAIL_TEMPLATE.OTP:
                content = templateOTP(data);
                break;
        }

        await transporter.sendMail({
            to,
            html: content.html,
            subject: content.subject,
            from: process.env.EMAIL_FROM
        });
    }
    catch (error) { throw error; }
};