import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_SERVER,
	port: parseInt(process.env.SMTP_PORT || '587'),
	secure: false,
	auth: {
		user: process.env.SMTP_USERNAME,
		pass: process.env.SMTP_PASSWORD,
	},
});

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
	const html = `
    <h3>Password Reset OTP</h3>
    <p>Use the OTP below to reset your password:</p>
    <h2>${otp}</h2>
    <p>This OTP expires in 15 minutes.</p>
  `;

	await transporter.sendMail({
		from: process.env.SMTP_SENDER_MAIL,
		to,
		subject: 'Your Password Reset OTP',
		html,
	});
};
