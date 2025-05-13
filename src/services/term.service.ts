import { Op } from "sequelize";
import { AppError } from "../utils/error.util";
import { validateUUID } from "../utils/validation.util";
import Term from "../models/term.model";
import Session from "../models/session.model";
import School from "../models/school.model";
import { TermInstance } from "../types/models.types";
import Assessment from "../models/assessment.model";

export class TermService {
  async createTerm(
    school_id: string,
    session_id: string,
    name: string,
    start_date: Date,
    end_date: Date
  ): Promise<TermInstance> {
    if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);
    if (!validateUUID(session_id))
      throw new AppError("Invalid session ID", 400);
    if (!name) throw new AppError("Term name is required", 400);
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

    const session = await Session.findByPk(session_id);
    if (!session) throw new AppError("Session not found", 404);
    if (session.school_id !== school_id)
      throw new AppError("Session does not belong to this school", 403);
    if (start_date < session.start_date || end_date > session.end_date) {
      throw new AppError("Term dates must be within session dates", 400);
    }

    const existingTerm = await Term.findOne({ where: { session_id, name } });
    if (existingTerm)
      throw new AppError("Term name already exists for this session", 400);

    const term = await Term.create({
      school_id,
      session_id,
      name,
      start_date,
      end_date,
    });
    return term;
  }

  async updateTerm(
    term_id: string,
    name: string,
    start_date: Date,
    end_date: Date
  ): Promise<TermInstance> {
    if (!validateUUID(term_id)) throw new AppError("Invalid term ID", 400);
    if (!name) throw new AppError("Term name is required", 400);
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

    const term = await Term.findByPk(term_id);
    if (!term) throw new AppError("Term not found", 404);

    const session = await Session.findByPk(term.session_id);
    if (!session) throw new AppError("Session not found", 404);
    if (start_date < session.start_date || end_date > session.end_date) {
      throw new AppError("Term dates must be within session dates", 400);
    }

    const existingTerm = await Term.findOne({
      where: {
        session_id: term.session_id,
        name,
        term_id: { [Op.ne]: term_id },
      },
    });
    if (existingTerm)
      throw new AppError("Term name already exists for this session", 400);

    await term.update({ name, start_date, end_date });
    return term;
  }

  async deleteTerm(term_id: string): Promise<void> {
    if (!validateUUID(term_id)) throw new AppError("Invalid term ID", 400);

    const term = await Term.findByPk(term_id);
    if (!term) throw new AppError("Term not found", 404);

    const assessments = await Assessment.findAll({ where: { term_id } });
    if (assessments.length > 0)
      throw new AppError("Cannot delete term with associated assessments", 400);

    await term.destroy();
  }

  async getTerms(
    session_id: string,
    school_id: string
  ): Promise<TermInstance[]> {
    if (!validateUUID(session_id))
      throw new AppError("Invalid session ID", 400);
    if (!validateUUID(school_id)) throw new AppError("Invalid school ID", 400);

    const session = await Session.findOne({ where: { session_id, school_id } });
    if (!session) throw new AppError("Session not found in this school", 404);

    const terms = await Term.findAll({ where: { session_id } });
    return terms;
  }
}
