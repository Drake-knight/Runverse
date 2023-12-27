import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import dotenv from "dotenv";
dotenv.config();

//transporter is a way to send mail.
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// mailgen is a way to generate mail.
const mailGenerators = {
    "email-verification": new Mailgen({
        theme: "default",
        product: {
            name: "Adopt a Tree",
            link: "https://aat.com"
        }
    }),
    "welcome": new Mailgen({
        theme: "default",
        product: {
            name: "Adopt a Tree",
            link: "https://aat.com"
        }
    }),
    "password-reset": new Mailgen({
        theme: "default",
        product: {
            name: "Adopt a Tree",
            link: "https://aat.com"
        }
    })
};

export const sendMail = async (email, type, data) => {
    try {
        const recipients = [email];

        const mailGenerator = mailGenerators[type];

        if (!mailGenerator) {
            throw new Error(`Invalid email type: ${type}`);
        }

        // Generate an HTML email with the provided data objects.
        let emailTemplate;
        switch (type) {
            case "email-verification":
                emailTemplate = mailGenerator.generate({
                    body: {
                        intro: "Welcome to Adopt a Tree! Confirm your email address to get started.",
                        action: {
                            instructions: "Your verification code",
                            button: {
                                color: "#22BC66",
                                text: data.verificationCode,
                            }
                        }
                    }
                });
                break;

            case "welcome":
                emailTemplate = mailGenerator.generate({
                    body: {
                        intro: `Welcome to Adopt a Tree, ${data.name}!`,
                        action: {
                            instructions: "Your User ID.",
                            button: {
                                color: "#22BC66",
                                text: data.userID,
                            }
                        }
                    }
                });
                break;

            case "password-reset":
                emailTemplate = mailGenerator.generate({
                    body: {
                        intro: `Hi ${data.name} ,You have requested a password reset.`,
                        action: {
                            instructions: "Password verification code.",
                            button: {
                                color: "#22BC66",
                                text: data.code,
                            }
                        }
                    }
                });
                break;

            default:
                throw new Error(`Invalid email type: ${type}`);
        }

        const mailOptions = {
            from: "pulkitnsut42@gmail.com",
            to: recipients,
            subject: type,
            html: emailTemplate,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
