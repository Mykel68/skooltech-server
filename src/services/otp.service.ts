import Otp, { OtpInstance } from '../models/otp.model';

export const generateOtp = (): string => {
	// Generate 6-digit OTP as a string
	return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOrReplaceOtp = async (user_id: string): Promise<string> => {
	try {
		// Remove any existing OTP for this user
		await Otp.destroy({ where: { user_id } });

		const otp = generateOtp();
		const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

		await Otp.create({ user_id, otp, expires_at });

		return otp;
	} catch (error) {
		console.error('Error creating OTP:', error);
		throw error;
	}
};

export const verifyOtp = async (
	user_id: string,
	submittedOtp: string
): Promise<boolean> => {
	try {
		const record = (await Otp.findOne({
			where: { user_id, otp: submittedOtp },
		})) as OtpInstance | null;

		if (!record) return false;

		if (new Date() > record.expires_at) {
			return false;
		}

		// Now this works because `record` has `id`
		await Otp.destroy({ where: { id: record.id } });
		return true;
	} catch (error) {
		console.error('Error verifying OTP:', error);
		return false;
	}
};
