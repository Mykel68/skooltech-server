import bcrypt from 'bcrypt';
import { Model } from 'sequelize';
import User from '../models/user.model';
import School from '../models/school.model';
import { AppError } from '../utils/error.util';
import { UserCreationData, UserRegistrationData, UserInstance } from '../types/user.types';

// Admin user creation
export const createUser = async (userData: UserCreationData): Promise<UserInstance> => {
  const { username, password, email, role, school_id, first_name, last_name } = userData;

  if (!['Admin', 'Teacher', 'Student', 'Parent'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) throw new AppError('Username already exists', 400);

  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) throw new AppError('Email already exists', 400);

  const school = await School.findByPk(school_id);
  if (!school) throw new AppError('School not found', 404);

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password_hash,
    email,
    role,
    school_id,
    first_name,
    last_name,
    is_approved: role === 'Teacher' ? false : true,
  }) as UserInstance;

  return user;
};

// Self-registration for students and teachers
export const registerUser = async (userData: UserRegistrationData, school_id: string): Promise<UserInstance> => {
  const { username, password, email, role, first_name, last_name } = userData;

  // Restrict to Student or Teacher roles
  if (!['Student', 'Teacher'].includes(role)) {
    throw new AppError('Invalid role for registration', 400);
  }

  // Check for existing username or email
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) throw new AppError('Username already exists', 400);

  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) throw new AppError('Email already exists', 400);

  // Validate school_id
  const school = await School.findByPk(school_id);
  if (!school) throw new AppError('School not found', 404);

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password_hash,
    email,
    role,
    school_id,
    first_name,
    last_name,
    is_approved: role === 'Teacher' ? false : true,
  }) as UserInstance;

  return user;
};