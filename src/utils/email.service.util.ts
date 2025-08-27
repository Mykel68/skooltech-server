import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_SERVER!,
	port: parseInt(process.env.SMTP_PORT || '587', 10),
	secure: false,
	auth: {
		user: process.env.SMTP_USERNAME!,
		pass: process.env.SMTP_PASSWORD!,
	},
});

export const sendResetEmail = async (
	to: string,
	resetUrl: string
): Promise<void> => {
	const html = `
    <h2>Password Reset</h2>
    <p>Click below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link expires in 15 minutes.</p>
  `;

	await transporter.sendMail({
		from: process.env.SMTP_SENDER_MAIL!,
		to,
		subject: 'Reset Your Password',
		html,
	});
};
