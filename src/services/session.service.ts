import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import Session from "../models/session.model";
import School from "../models/school.model";
import { SessionInstance } from "../types/models.types";

export const createSession = async (
  school_id: string,
  name: string,
  start_date: Date,
  end_date: Date
): Promise<SessionInstance> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
  if (!name) throw new AppError("Session name is required", 400);
  if (
    !start_date ||
    !end_date ||
    isNaN(start_date.getTime()) ||
    isNaN(end_date.getTime())
  ) {
    throw new AppError("Valid start and end dates are required", 400);
  }
  if (end_date <= start_date)
    throw new AppError("End date must be after start date", 400);

  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  const existingSession = await Session.findOne({ where: { school_id, name } });
  if (existingSession)
    throw new AppError("Session name already exists for this school", 400);

  const session = await Session.create({
    school_id,
    name,
    start_date,
    end_date,
  });
  return session;
};

export const getSessions = async (
  school_id: string
): Promise<SessionInstance[]> => {
  if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

  const sessions = await Session.findAll({ where: { school_id } });
  return sessions;
};
